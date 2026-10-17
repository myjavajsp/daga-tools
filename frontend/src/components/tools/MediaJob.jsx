import { useState, useEffect, useRef, useCallback } from 'react';
import { fmtSize, downloadBlob, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';
import { uploadForBlob } from '../../lib/upload';
import { Dropzone } from '../ToolUI';

/**
 * MediaJob —— 音视频处理通用组件
 *
 * 所有音视频工具共用同一套交互：
 *   选文件 → 配置参数 → 上传处理（带进度）→ 自动下载结果
 *
 * 处理在服务端由 ffmpeg 完成，避免前端 ffmpeg.wasm 需要的
 * COOP/COEP 跨域隔离响应头（那会让第三方解析 iframe 全部失效）。
 */
export default function MediaJob({
  job,
  accept,
  icon = 'filmstrip',
  hint = '',
  options = [],
  defaultOptions = {},
  buttonText = '开始处理',
}) {
  const [file, setFile] = useState(null);
  const [opts, setOpts] = useState(defaultOptions);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // 卸载后不再 setState，避免 React 警告
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // 预览 URL 回收
  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setError('');
    setResult(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setResult(null);
    setProgress(0);
    setPhase('上传中');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('job', job);
      fd.append('options', JSON.stringify(opts));
      fd.append('name', file.name);

      const blob = await uploadForBlob('/api/media/process', fd, (p) => {
        setProgress(p);
        if (p >= 100) setPhase('处理中');
      });

      const ext =
        job === 'extract-audio'
          ? opts.format || 'mp3'
          : job === 'compress-audio'
          ? 'mp3'
          : opts.format || 'mp4';
      const name = `${safeName(stripExt(file.name))}.${ext}`;

      // 音频可直接预览试听
      const canPlay = /^(mp3|m4a|wav|ogg|aac|mp4|webm)$/i.test(ext);
      setResult({
        name,
        size: blob.size,
        ext,
        url: canPlay ? URL.createObjectURL(blob) : null,
      });
      downloadBlob(blob, name);
    } catch (err) {
      if (alive.current) setError(err?.message || '处理失败');
    } finally {
      if (alive.current) {
        setBusy(false);
        setProgress(0);
        setPhase('');
      }
    }
  }, [file, job, opts]);

  const isVideo = file && /^video\//i.test(file.type);

  return (
    <div className="space-y-5">
      <Dropzone
        id={`mj-${job}`}
        accept={accept}
        icon={icon}
        onChange={handleFile}
        title={file ? `已选择：${file.name}（${fmtSize(file.size)}）` : '点击选择文件'}
        hint={hint}
      />

      {options.length > 0 && (
        <div className="space-y-4">
          {options.map((o) => (
            <div key={o.key}>
              <label className="lbl">
                {o.label}
              </label>
              {o.type === 'choice' ? (
                <div className="flex gap-2 flex-wrap">
                  {o.choices.map((c, ci) => (
                    <button
                      key={String(c)}
                      type="button"
                      onClick={() => setOpts((prev) => ({ ...prev, [o.key]: c }))}
                  className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${
                        String(opts[o.key]) === String(c)
                          ? 'bg-accent text-accent-fg'
                          : 'bg-surface-2 text-ink-2'
                      }`}
                    >
                      {o.labels ? o.labels[ci] : String(c).toUpperCase()}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  value={opts[o.key]}
                  min={o.min}
                  max={o.max}
                  onChange={(e) => setOpts((prev) => ({ ...prev, [o.key]: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {file && (
        <button onClick={run} disabled={busy} className={BTN_PRIMARY}>
          {busy ? (phase === '上传中' ? `上传中 ${progress}%` : '处理中…') : buttonText}
        </button>
      )}

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">处理完成！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            {result.name} · {fmtSize(result.size)}
          </div>
          {result.url && (
            isVideo ? (
              <video src={result.url} controls className="mt-3 max-h-48 mx-auto rounded-lg" />
            ) : (
              <audio src={result.url} controls className="mt-3 w-full" />
            )
          )}
        </div>
      )}
    </div>
  );
}
