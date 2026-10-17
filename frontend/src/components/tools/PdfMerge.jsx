import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Icon from '../Icons';
import { fmtSize, downloadBlob, readAsArrayBuffer, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

export default function PdfMerge() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).filter(
      (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
    );
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

  const merge = async () => {
    if (files.length < 2) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const buf = await readAsArrayBuffer(f);
        const src = await PDFDocument.load(buf, { ignoreEncryption: true });
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const name = `${safeName(stripExt(files[0].name))}-merged.pdf`;
      setResult({ name, size: blob.size, pages: out.getPageCount() });
      downloadBlob(blob, name);
    } catch (err) {
      setError(err?.message || '合并失败，请确认文件是有效的 PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('mf')?.click()}
      >
        <input id="mf" type="file" accept=".pdf,application/pdf" multiple onChange={handleFiles} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="doc" /></span></div>
        <p className="text-ink-2">
          {files.length > 0 ? `已选择 ${files.length} 个PDF（点击下方文件名可移除）` : '点击选择PDF文件（可多选）'}
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
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="icon-btn"
                  title="上移"
                  aria-label="上移"
                >
                  <Icon name="up" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === files.length - 1}
                  className="icon-btn"
                  title="下移"
                  aria-label="下移"
                >
                  <Icon name="down" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="icon-btn hover:text-danger"
                  title="移除"
                  aria-label="移除"
                >
                  <Icon name="close" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={merge} disabled={files.length < 2 || busy} className={BTN_PRIMARY}>
        {busy ? '正在合并…' : files.length < 2 ? '请至少选择 2 个 PDF' : '合并PDF'}
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">合并成功！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            共 {result.pages} 页 · {fmtSize(result.size)} · {result.name}
          </div>
        </div>
      )}
    </div>
  );
}
