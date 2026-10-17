import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import Icon from '../Icons';
import { fmtSize, downloadBlob, readAsArrayBuffer, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

export default function PdfSplit() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFile = useCallback(async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) {
      setError('请选择 PDF 文件');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
    setBusy(true);
    try {
      const buf = await readAsArrayBuffer(f);
      // 先读一遍拿到真实页数（加密文档无法解析，pdf-lib 不支持解密）
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const n = doc.getPageCount();
      setTotal(n);
      setStart(1);
      setEnd(n);
    } catch (err) {
      setFile(null);
      setTotal(0);
      setError(
        /encrypt/i.test(String(err?.message || ''))
          ? '该 PDF 已加密，无法在浏览器端处理（pdf-lib 不支持解密）'
          : 'PDF 解析失败，文件可能已损坏'
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const split = async () => {
    if (!file || !total) return;
    const s = Math.max(1, Math.min(start, total));
    const e = Math.max(s, Math.min(end, total));
    setBusy(true);
    setError('');
    try {
      const buf = await readAsArrayBuffer(file);
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const indices = [];
      for (let i = s - 1; i <= e - 1; i += 1) indices.push(i);
      const copied = await out.copyPages(src, indices);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const name = `${safeName(stripExt(file.name))}-p${s}-${e}.pdf`;
      setResult({ name, size: blob.size, start: s, end: e, count: indices.length });
      downloadBlob(blob, name);
    } catch (err) {
      setError(err?.message || '拆分失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('sf')?.click()}
      >
        <input id="sf" type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="doc" /></span></div>
        <p className="text-ink-2">
          {file ? `已选择: ${file.name}${total ? `（共 ${total} 页）` : ''}` : '上传PDF文件'}
        </p>
      </div>

      {total > 0 && (
        <div>
          <label className="lbl">
            选择页码范围（共 {total} 页）
          </label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="number"
              min={1}
              max={total}
              value={start}
              onChange={(e) => setStart(Number(e.target.value) || 1)}
              className="w-24 px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
            />
            <span className="text-ink-3 self-center">至</span>
            <input
              type="number"
              min={1}
              max={total}
              value={end}
              onChange={(e) => setEnd(Number(e.target.value) || 1)}
              className="w-24 px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
            />
            <button
              onClick={split}
              disabled={busy}
              className="btn-a px-4 text-sm"
            >
              {busy ? '处理中…' : '拆分'}
            </button>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {[[1, Math.ceil(total / 2)], [Math.ceil(total / 2) + 1, total]].map(
              ([a, b], i) =>
                b >= a && (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setStart(a);
                      setEnd(b);
                    }}
                    className="px-2 py-1 text-xs rounded-md bg-surface-2 text-ink-2 hover:bg-surface-3"
                  >
                    第 {a}-{b} 页
                  </button>
                )
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">拆分完成！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            第{result.start}-{result.end}页，共{result.count}页，{fmtSize(result.size)}
          </div>
        </div>
      )}
    </div>
  );
}
