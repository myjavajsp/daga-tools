import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { fmtSize, downloadBlob, readAsArrayBuffer, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

export default function PdfCompress() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(60);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
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
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setProgress(0);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

      const buf = await readAsArrayBuffer(file);
      const src = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      const total = src.numPages;
      // 质量越低，渲染倍率越低 → 体积越小
      const scale = 0.6 + (quality / 100) * 1.4;

      const out = await PDFDocument.create();
      for (let n = 1; n <= total; n += 1) {
        const page = await src.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const jpegBlob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('图像生成失败'))), 'image/jpeg', quality / 100)
        );
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const img = await out.embedJpg(jpegBytes);
        const p = out.addPage([img.width, img.height]);
        p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        setProgress(Math.round((n / total) * 100));
      }
      await src.destroy();

      const bytes = await out.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const name = `${safeName(stripExt(file.name))}-compressed.pdf`;
      const saved = file.size - blob.size;
      setResult({
        name,
        size: blob.size,
        original: file.size,
        compressed: blob.size,
        saved,
        percent: file.size ? Math.max(0, Math.round((saved / file.size) * 100)) : 0,
      });
      downloadBlob(blob, name);
    } catch (err) {
      setError(err?.message || '压缩失败');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('cf')?.click()}
      >
        <input id="cf" type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📉</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传PDF压缩'}</p>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">压缩质量</span>
          <span className="font-mono text-gray-900 dark:text-white">{quality}%</span>
        </div>
        <input
          type="range"
          min="30"
          max="100"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <p className="text-xs text-gray-400 mt-2">
          质量越低体积越小。压缩通过栅格化重采样实现，输出为图片版 PDF（文字将不可选中）。
        </p>
      </div>

      <button onClick={compress} disabled={!file || busy} className={BTN_PRIMARY}>
        {busy ? `压缩中 ${progress}%` : '压缩PDF'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">压缩完成！已开始下载</div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
            <div>
              <div className="text-gray-500">原大小</div>
              <div className="font-bold">{fmtSize(result.original)}</div>
            </div>
            <div>
              <div className="text-gray-500">压缩后</div>
              <div className="font-bold text-green-600">{fmtSize(result.compressed)}</div>
            </div>
            <div>
              <div className="text-gray-500">节省</div>
              <div className="font-bold text-blue-600">
                {result.saved > 0 ? `${result.percent}%` : '0%（原文件已较小）'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
