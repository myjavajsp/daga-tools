import { useState, useEffect } from 'react';
import { fmtSize, downloadBlob, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

export default function ImageBgRemove() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!resultUrl) return undefined;
    return () => URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\//i.test(f.type)) {
      setError('请上传图片文件');
      return;
    }
    setError('');
    setResultUrl('');
    setResultBlob(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeBg = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setProgress(0);
    try {
      // 懒加载：ONNX 运行时 + U2Net 模型约 5-10MB，首次点击才下载
      const mod = await import('@imgly/background-removal');
      const imglyRemoveBackground = mod.default || mod;
      const blob = await imglyRemoveBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
        output: { format: 'image/png' },
      });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err?.message || '抠图失败，请换一张主体更清晰的图片重试');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const download = () => {
    if (resultBlob) downloadBlob(resultBlob, `${safeName(stripExt(file?.name || 'image'))}-nobg.png`);
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('bf')?.click()}
      >
        <input id="bf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-gray-600 dark:text-gray-400">
          {preview ? '点击更换图片' : '上传图片去除背景'}
        </p>
        <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP</p>
      </div>

      {preview && !(resultUrl || busy) && (
        <div className="text-center">
          <img src={preview} alt="原图" className="max-h-48 mx-auto rounded-xl" />
        </div>
      )}

      {busy && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            {progress ? `正在处理 ${progress}%` : '首次使用需下载模型（约 5-10MB），请稍候…'}
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.max(8, progress)}%` }} />
          </div>
        </div>
      )}

      {resultUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-2 text-center">原始图片</div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
              <img src={preview} alt="原图" className="w-full object-contain rounded-lg" />
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-2 text-center">去背景后</div>
            {/* 棋盘格底衬，直观展示透明区域 */}
            <div
              className="rounded-xl p-2"
              style={{
                backgroundImage:
                  'linear-gradient(45deg,#d1d5db 25%,transparent 25%),linear-gradient(-45deg,#d1d5db 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d1d5db 75%),linear-gradient(-45deg,transparent 75%,#d1d5db 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0,0 8px,8px -8px,-8px 0px',
              }}
            >
              <img src={resultUrl} alt="去背景结果" className="w-full object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      <button onClick={removeBg} disabled={!file || busy} className={BTN_PRIMARY}>
        {busy ? 'AI处理中…' : 'AI去背景'}
      </button>

      {resultUrl && (
        <button onClick={download} className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600">
          下载透明背景图片（PNG）
        </button>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {resultUrl && (
        <p className="text-xs text-gray-400">
          AI 抠图在你的浏览器本地完成，图片不会上传到任何服务器。复杂图片可能耗时较久。
        </p>
      )}
    </div>
  );
}
