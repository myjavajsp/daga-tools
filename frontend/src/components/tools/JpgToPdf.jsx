import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Icon from '../Icons';
import { fmtSize, downloadBlob, readAsArrayBuffer, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

const isPng = (f) => f.type === 'image/png' || /\.png$/i.test(f.name);
const isJpg = (f) => /jpe?g/i.test(f.type) || /\.jpe?g$/i.test(f.name);

export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).filter((f) => isPng(f) || isJpg(f));
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected]);
      setResult(null);
      setError('');
    }
    e.target.value = '';
  };

  const removeAt = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i, dir) =>
    setFiles((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const convert = async () => {
    if (!files.length) return;
    setBusy(true);
    setError('');
    setProgress(0);
    try {
      const doc = await PDFDocument.create();
      for (let i = 0; i < files.length; i += 1) {
        const f = files[i];
        const buf = await readAsArrayBuffer(f);
        const img = isPng(f) ? await doc.embedPng(buf) : await doc.embedJpg(buf);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      const bytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const name = `${safeName(files.length === 1 ? stripExt(files[0].name) : 'images')}.pdf`;
      setResult({ name, size: blob.size, count: files.length });
      downloadBlob(blob, name);
    } catch (err) {
      setError(
        /unsupported|not supported/i.test(String(err?.message || ''))
          ? '仅支持 PNG / JPG 格式图片'
          : err?.message || '转换失败'
      );
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('j2p')?.click()}
      >
        <input id="j2p" type="file" accept="image/png,image/jpeg" multiple onChange={handleFiles} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="image" /></span></div>
        <p className="text-ink-2">
          {files.length > 0 ? `已选择 ${files.length} 张图片（顺序可调整）` : '点击选择图片（PNG / JPG，可多选）'}
        </p>
      </div>

      {files.length > 0 && (
        <div className="max-h-40 overflow-auto space-y-1">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center justify-between text-sm text-ink-2 px-3 py-1.5 bg-paper rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-ink-3 w-5 text-right flex-shrink-0">{i + 1}</span>
                <span className="truncate">{f.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-ink-3">{fmtSize(f.size)}</span>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="上移" aria-label="上移" className="icon-btn"><Icon name="up" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === files.length - 1} title="下移" aria-label="下移" className="icon-btn"><Icon name="down" /></button>
                <button type="button" onClick={() => removeAt(i)} title="移除" aria-label="移除" className="icon-btn hover:text-danger"><Icon name="close" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={convert} disabled={!files.length || busy} className={BTN_PRIMARY}>
        {busy ? `转换中 ${progress}%` : '转换为PDF'}
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">转换成功！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            {result.count} 张图片 · {result.pages || result.count} 页 · {fmtSize(result.size)}
          </div>
        </div>
      )}
    </div>
  );
}
