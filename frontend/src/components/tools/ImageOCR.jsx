import { useState, useEffect } from 'react';
import { fmtSize, downloadBlob, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

const LANGS = [
  { value: 'chi_sim+eng', label: '中文+英文' },
  { value: 'chi_sim', label: '简体中文' },
  { value: 'eng', label: '英文' },
];

export default function ImageOCR() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [lang, setLang] = useState('chi_sim+eng');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // 释放预览 URL，避免内存泄漏
  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\//i.test(f.type)) {
      setError('请上传图片文件');
      return;
    }
    setError('');
    setResult('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const runOCR = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setProgress(0);
    let worker = null;
    try {
      // 懒加载：tesseract.js 体积较大（wasm + 语言包），仅在点击时才下载
      const { createWorker } = await import('tesseract.js');
      worker = await createWorker(lang, undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round((m.progress || 0) * 100));
          }
        },
      });
      const { data } = await worker.recognize(file);
      const text = String(data?.text || '').trim();
      setResult(text || '（未识别到文字，试试更清晰、文字更大的图片）');
    } catch (err) {
      setError(err?.message || '识别失败，请换一张更清晰的图片重试');
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {}
      }
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('oi')?.click()}
      >
        <input id="oi" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📷</div>
        <p className="text-gray-600 dark:text-gray-400">
          {file ? `已选择: ${file.name}` : '上传截图或照片'}
        </p>
      </div>

      {preview && (
        <div className="flex justify-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <img src={preview} alt="待识别图片" className="max-h-64 object-contain rounded-lg" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">识别语言</label>
        <div className="flex gap-2 flex-wrap">
          {LANGS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLang(l.value)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                lang === l.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          中文识别需下载约 15MB 语言包（首次较慢，之后浏览器会缓存）
        </p>
      </div>

      <button onClick={runOCR} disabled={!file || busy} className={BTN_PRIMARY}>
        {busy ? (progress ? `识别中 ${progress}%` : '正在加载识别引擎…') : '开始识别'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-green-700 dark:text-green-400 font-medium">识别完成</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                {copied ? '✓ 已复制' : '复制'}
              </button>
              <button
                onClick={() =>
                  downloadBlob(
                    new Blob([result], { type: 'text/plain;charset=utf-8' }),
                    `${safeName(stripExt(file?.name || 'ocr'))}.txt`
                  )
                }
                className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                下载TXT
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={result}
            className="w-full h-48 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-2">
          识别在你自己的浏览器里完成（Tesseract 引擎），图片不会上传到服务器。
          </p>
        </div>
      )}
    </div>
  );
}
