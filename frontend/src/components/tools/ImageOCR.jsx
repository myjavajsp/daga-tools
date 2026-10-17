import { useState, useEffect } from 'react';
import { fmtSize, downloadBlob, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';
import Icon from '../Icons';

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
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('oi')?.click()}
      >
        <input id="oi" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="camera" /></span></div>
        <p className="text-ink-2">
          {file ? `已选择: ${file.name}` : '上传截图或照片'}
        </p>
      </div>

      {preview && (
        <div className="flex justify-center bg-paper rounded-card p-3">
          <img src={preview} alt="待识别图片" className="max-h-64 object-contain rounded-lg" />
        </div>
      )}

      <div>
        <label className="lbl">识别语言</label>
        <div className="flex gap-2 flex-wrap">
          {LANGS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLang(l.value)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                lang === l.value
                  ? 'bg-accent text-accent-fg border-accent'
                  : 'bg-paper text-ink-2 border-line'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-3 mt-1">
          中文识别需下载约 15MB 语言包（首次较慢，之后浏览器会缓存）
        </p>
      </div>

      <button onClick={runOCR} disabled={!file || busy} className={BTN_PRIMARY}>
        {busy ? (progress ? `识别中 ${progress}%` : '正在加载识别引擎…') : '开始识别'}
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-success font-medium">识别完成</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-2 py-1 text-xs rounded bg-accent text-accent-fg hover:bg-accent-press"
              >
                {copied ? '已复制' : '复制'}
              </button>
              <button
                onClick={() =>
                  downloadBlob(
                    new Blob([result], { type: 'text/plain;charset=utf-8' }),
                    `${safeName(stripExt(file?.name || 'ocr'))}.txt`
                  )
                }
                className="px-2 py-1 text-xs rounded bg-surface-2 text-ink-2 hover:bg-surface-3"
              >
                下载TXT
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={result}
            className="input px-4 py-3 min-h-48 resize-none"
          />
          <p className="text-xs text-ink-3 mt-2">
          识别在你自己的浏览器里完成（Tesseract 引擎），图片不会上传到服务器。
          </p>
        </div>
      )}
    </div>
  );
}
