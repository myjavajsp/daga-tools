import { useState, useEffect, useRef, useCallback } from 'react';
import { fmtSize, downloadBlob, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';
import { uploadForBlob } from '../../lib/upload';

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
  icon = '🎬',
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
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById(`mj-${job}`)?.click()}
      >
        <input id={`mj-${job}`} type="file" accept={accept} onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">{icon}</div>
        <p className="text-gray-600 dark:text-gray-400">
          {file ? `已选择: ${file.name}（${fmtSize(file.size)}）` : '点击选择文件'}
        </p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>

      {options.length > 0 && (
        <div className="space-y-4">
          {options.map((o) => (
            <div key={o.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {o.label}
              </label>
              {o.type === 'choice' ? (
                <div className="flex gap-2 flex-wrap">
                  {o.choices.map((c, ci) => (
                    <button
                      key={String(c)}
                      type="button"
                      onClick={() => setOpts((prev) => ({ ...prev, [o.key]: c }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        String(opts[o.key]) === String(c)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">处理完成！已开始下载</div>
          <div className="text-sm text-gray-500 mt-1">
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
