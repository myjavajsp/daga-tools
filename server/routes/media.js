/**
 * daga-clone — server/routes/media.js
 * 音视频处理：POST /api/media/process
 *
 * 为什么走后端 ffmpeg 而不是前端 ffmpeg.wasm：
 *   ffmpeg.wasm 的多线程核心依赖 SharedArrayBuffer，要求全站响应头带
 *   Cross-Origin-Opener-Policy: same-origin + Cross-Origin-Embedder-Policy: require-corp；
 *   一旦开启 COEP，所有第三方跨域资源（包括解析站 iframe、外链图片）若不带 CORP 头
 *   会直接加载失败——等于为音视频功能把解析播放搞挂。
 *   后端 ffmpeg 没有这些副作用：无体积负担、无大小限制、速度快、不占用户上行流量。
 *
 * 传输约定（不用 FormData，免去 multer 依赖）：
 *   - 请求体 = 原始文件字节
 *   - 任务类型放 X-Job 头，参数放 X-Options 头（JSON 字符串）
 *   - 响应 = 转换后的文件二进制
 */

const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const MAX_BYTES = 500 * 1024 * 1024; // 500MB
const TIMEOUT_MS = 8 * 60 * 1000;    // 8 分钟

/** 音频格式 -> 编码器 */
const AUDIO_CODECS = {
  mp3: 'libmp3lame',
  m4a: 'aac',
  aac: 'aac',
  ogg: 'libvorbis',
  wav: 'pcm_s16le',
  flac: 'flac',
};

/** 视频转换目标格式白名单 */
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'gif'];

/**
 * 重编码回退方案（容器 -> 编码参数）。
 * convert 默认先尝试 `-c copy`（零损耗、极快），但目标容器不支持源编码时会失败
 * （典型：h264+aac 塞进 webm 非法），此时用它重编码再跑一次。
 */
const REENCODE_CODECS = {
  mp4: ['-c:v', 'libx264', '-c:a', 'aac'],
  mov: ['-c:v', 'libx264', '-c:a', 'aac'],
  mkv: ['-c:v', 'libx264', '-c:a', 'aac'],
  webm: ['-c:v', 'libvpx-vp9', '-c:a', 'libopus'],
  avi: ['-c:v', 'mpeg4', '-c:a', 'libmp3lame'],
  gif: ['-c:v', 'gif', '-an'],
};

/** 输出 MIME 映射 */
const MIME = {
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac',
  ogg: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  mkv: 'video/x-matroska', avi: 'video/x-msvideo', gif: 'image/gif',
};

/** 数值钳制，防止用户传入超大值拖垮服务 */
function clamp(v, def, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

/**
 * 构造 ffmpeg 参数（不含输出文件）。
 * 所有入参经过白名单/范围校验；spawn 使用数组形式、不经 shell，杜绝命令注入。
 * 返回 { ext, args } 或 null（不支持的任务）。
 */
function buildArgs(job, opts, input) {
  const o = opts && typeof opts === 'object' ? opts : {};

  if (job === 'extract-audio') {
    const fmt = Object.prototype.hasOwnProperty.call(AUDIO_CODECS, o.format) ? o.format : 'mp3';
    const bitrate = clamp(o.bitrate, 192, 32, 320);
    return { ext: fmt, args: ['-y', '-i', input, '-vn', '-c:a', AUDIO_CODECS[fmt], '-b:a', `${bitrate}k`] };
  }

  if (job === 'convert') {
    const ext = VIDEO_EXTS.includes(String(o.format || '').toLowerCase()) ? String(o.format).toLowerCase() : 'mp4';
    const codecs = o.reencode ? REENCODE_CODECS[ext] || REENCODE_CODECS.mp4 : ['-c', 'copy'];
    return { ext, args: ['-y', '-i', input].concat(codecs) };
  }

  if (job === 'trim') {
    const start = clamp(o.start, 0, 0, 24 * 3600);
    const duration = clamp(o.duration, 30, 1, 4 * 3600);
    const ext = VIDEO_EXTS.includes(String(o.format || '').toLowerCase()) ? String(o.format).toLowerCase() : 'mp4';
    return {
      ext,
      args: ['-y', '-ss', String(start), '-i', input, '-t', String(duration), '-c', 'copy'],
    };
  }

  if (job === 'compress-audio') {
    const bitrate = clamp(o.bitrate, 128, 32, 320);
    return { ext: 'mp3', args: ['-y', '-i', input, '-vn', '-c:a', 'libmp3lame', '-b:a', `${bitrate}k`] };
  }

  if (job === 'video-to-gif') {
    const start = clamp(o.start, 0, 0, 24 * 3600);
    const duration = clamp(o.duration, 3, 1, 30);
    const fps = clamp(o.fps, 12, 5, 24);
    const width = clamp(o.width, 480, 160, 800);
    const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
    return { ext: 'gif', args: ['-y', '-ss', String(start), '-t', String(duration), '-i', input, '-vf', vf, '-loop', '0'] };
  }

  return null;
}

/** 执行 ffmpeg；返回生成的输出文件路径 */
function runFfmpeg(args, outFile) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args.concat([outFile]), {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
      if (stderr.length > 20000) stderr = stderr.slice(-20000);
    });

    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {}
      reject(new Error('处理超时，文件可能过大或格式复杂'));
    }, TIMEOUT_MS);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(err?.code === 'ENOENT' ? '服务器未安装 ffmpeg' : 'ffmpeg 启动失败'));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(outFile);
        return;
      }
      const tail = stderr.trim().split('\n').slice(-3).join(' ').slice(0, 300);
      reject(new Error(tail || `ffmpeg 退出码 ${code}`));
    });
  });
}

module.exports = function () {
  const router = express.Router();
  const rawUpload = express.raw({ type: '*/*', limit: MAX_BYTES });

  router.post('/process', rawUpload, async (req, res) => {
    const job = String(req.get('X-Job') || '');
    let opts = {};
    try {
      const parsed = JSON.parse(String(req.get('X-Options') || '{}'));
      if (parsed && typeof parsed === 'object') opts = parsed;
    } catch {
      opts = {};
    }

    // 先校验任务白名单（用占位路径，此处只关心是否为 null）
    const probe = buildArgs(job, opts, '/dev/null');
    if (!probe) {
      return res.status(400).json({ success: false, message: '不支持的处理任务' });
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ success: false, message: '未收到文件数据' });
    }

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'media-'));
    const stamp = Date.now();
    const inFile = path.join(dir, `in-${stamp}`);
    const outFile = path.join(dir, `out-${stamp}.${probe.ext}`);

    try {
      fs.writeFileSync(inFile, req.body);
      try {
        await runFfmpeg(buildArgs(job, opts, inFile).args, outFile);
      } catch (firstErr) {
        // convert 跨容器时流复用可能不被允许，退回「重新编码」再试一次
        if (job === 'convert') {
          await runFfmpeg(
            buildArgs(job, { ...opts, reencode: true }, inFile).args,
            outFile
          );
        } else {
          throw firstErr;
        }
      }

      if (!fs.existsSync(outFile)) {
        throw new Error('未生成输出文件');
      }

      // 输出文件名：原名去扩展 + 目标扩展
      const rawName = String(req.get('X-File-Name') || 'output');
      const base = rawName.replace(/\.[^.]+$/, '').slice(0, 60);
      res.setHeader('Content-Type', MIME[probe.ext] || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(`${base}.${probe.ext}`)}`
      );
      // 发送后用回调删掉临时目录
      return res.sendFile(outFile, (err) => {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch {}
        if (err) console.error('[media] sendFile error:', err.message);
      });
    } catch (err) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {}
      const msg = String(err?.message || '');
      const friendly = /Invalid data|moov atom|Invalid argument|does not contain any stream/i.test(msg)
        ? '无法解析该文件，请确认是有效的音视频文件'
        : msg.slice(0, 300) || '处理失败';
      return res.status(500).json({ success: false, message: friendly });
    }
  });

  return router;
};
