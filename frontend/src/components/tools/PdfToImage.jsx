import { useState } from 'react';
import { fmtSize, downloadBlob, readAsArrayBuffer, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';
import Icon from '../Icons';

export default function PdfToImage() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [scale, setScale] = useState(2);
  const [fmt, setFmt] = useState('png');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
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
      const pdfjsLib = await import('pdfjs-dist');
      const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
      const buf = await readAsArrayBuffer(f);
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      setTotal(doc.numPages);
      await doc.destroy();
    } catch (err) {
      setFile(null);
      setTotal(0);
      setError(/encrypt/i.test(String(err?.message || '')) ? '该 PDF 已加密，无法解析' : 'PDF 解析失败，文件可能已损坏');
    } finally {
      setBusy(false);
    }
  };

  const convert = async () => {
    if (!file || !total) return;
    setBusy(true);
    setError('');
    setProgress(0);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
      const { zipSync } = await import('fflate');
      const buf = await readAsArrayBuffer(file);
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;

      const entries = {};
      const base = safeName(stripExt(file.name));
      for (let n = 1; n <= total; n += 1) {
        const page = await doc.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('图片生成失败'))), fmt === 'png' ? 'image/png' : 'image/jpeg', 0.92)
        );
        entries[`${base}-p${n}.${fmt}`] = new Uint8Array(await blob.arrayBuffer());
        setProgress(Math.round((n / total) * 100));
      }
      await doc.destroy();

      if (total === 1) {
        const [name, data] = Object.entries(entries)[0];
        const blob = new Blob([data], { type: fmt === 'png' ? 'image/png' : 'image/jpeg' });
        setResult({ name, size: blob.size, count: 1 });
        downloadBlob(blob, name);
      } else {
        const zipped = zipSync(entries, { level: 6 });
        const blob = new Blob([zipped], { type: 'application/zip' });
        const name = `${base}-images.zip`;
        setResult({ name, size: blob.size, count: total });
        downloadBlob(blob, name);
      }
    } catch (err) {
      setError(err?.message || '转换失败');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('p2i')?.click()}
      >
        <input id="p2i" type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="image" /></span></div>
        <p className="text-ink-2">
          {file ? `已选择: ${file.name}${total ? `（${total} 页）` : ''}` : '上传PDF转图片'}
        </p>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="lbl">
              输出清晰度：{scale}x
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    scale === s
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-paper text-ink-2 border-line'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">输出格式</label>
            <div className="flex gap-2">
              {['png', 'jpg'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFmt(f)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    fmt === f
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-paper text-ink-2 border-line'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={convert} disabled={!total || busy} className={BTN_PRIMARY}>
        {busy ? `转换中 ${progress}%` : `转换为${fmt.toUpperCase()}`}
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
            {result.count > 1 ? `${result.count} 张图片打包为 ZIP` : '单张图片'} · {fmtSize(result.size)}
          </div>
        </div>
      )}
    </div>
  );
}
