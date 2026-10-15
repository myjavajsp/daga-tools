/**
 * daga-clone — server/routes/pdf.js
 * PDF 加解密：POST /api/pdf/crypt
 *
 * 为什么不在浏览器端做：
 *   浏览器端用的 pdf-lib 只支持「读取」PDF，**不支持写出加密 PDF**，
 *   也无法用密码解密受保护的文档。所以加解密都交给服务端的 qpdf。
 *
 * 传输约定（与 media.js 一致，避免引入 multer）：
 *   - 请求体 = 原始 PDF 字节
 *   - X-Mode: lock | unlock
 *   - X-Password: 密码
 *   - X-File-Name: 原始文件名（用于生成输出名）
 *   - 响应 = 处理后的 PDF 二进制
 */

const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const MAX_BYTES = 200 * 1024 * 1024; // 200MB
const TIMEOUT_MS = 3 * 60 * 1000;    // 3 分钟

/** 执行 qpdf，返回输出文件路径 */
function runQpdf(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('qpdf', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
      if (stderr.length > 20000) stderr = stderr.slice(-20000);
    });

    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {}
      reject(new Error('处理超时，文件可能过大'));
    }, TIMEOUT_MS);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(err?.code === 'ENOENT' ? '服务器未安装 qpdf' : 'qpdf 启动失败'));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }
      const normalized = String(stderr || '').toLowerCase();
      const msg = /invalid password|password/.test(normalized)
        ? '密码错误，请确认后重试'
        : normalized.trim().split('\n').slice(-3).join(' ').slice(0, 300) || `qpdf 退出码 ${code}`;
      reject(new Error(msg));
    });
  });
}

module.exports = function () {
  const router = express.Router();
  const rawUpload = express.raw({ type: '*/*', limit: MAX_BYTES });

  router.post('/crypt', rawUpload, async (req, res) => {
    const mode = String(req.get('X-Mode') || '');
    const password = String(req.get('X-Password') || '');

    if (mode !== 'lock' && mode !== 'unlock') {
      return res.status(400).json({ success: false, message: '无效的处理模式' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: '请输入密码' });
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ success: false, message: '未收到文件数据' });
    }
    // PDF 文件头校验，避免把任意文件丢给 qpdf
    if (req.body.slice(0, 5).toString('latin1') !== '%PDF-') {
      return res.status(400).json({ success: false, message: '该文件不是有效的 PDF' });
    }

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-'));
    const stamp = Date.now();
    const inFile = path.join(dir, `in-${stamp}.pdf`);
    const outFile = path.join(dir, `out-${stamp}.pdf`);

    try {
      fs.writeFileSync(inFile, req.body);

      // spawn 以数组传参、不经 shell；密码即便是任意字符串也不会被当作命令执行
      const args =
        mode === 'lock'
          ? ['--encrypt', password, password, '256', '--', inFile, outFile]
          : [`--password=${password}`, '--decrypt', inFile, outFile];

      await runQpdf(args);

      if (!fs.existsSync(outFile)) {
        throw new Error('未生成输出文件');
      }

      const rawName = String(req.get('X-File-Name') || 'document.pdf');
      const base = rawName.replace(/\.[^.]+$/, '').slice(0, 60) || 'document';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(`${base}${mode === 'lock' ? '_encrypted' : '_unlocked'}.pdf`)}`
      );
      return res.sendFile(outFile, (err) => {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
      } catch {}
        if (err) console.error('[pdf] sendFile error:', err.message);
      });
    } catch (err) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {}
      return res.status(500).json({ success: false, message: String(err?.message || '处理失败').slice(0, 300) });
    }
  });

  return router;
};
