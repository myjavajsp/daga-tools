import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { fmtSize, downloadBlob, readAsArrayBuffer, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState('');

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
    setPreview('');
    setFile(f);
  };

  /**
   * 用 pdf.js 逐页提取文本项，按 y 坐标聚合成行。
   * 说明：这是「文本抽取 + 重新排版」，会丢失原始版式与图片。
   */
  const extractLines = async () => {
    const pdfjsLib = await import('pdfjs-dist');
    const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

    const buf = await readAsArrayBuffer(file);
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const lines = [];

    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const tc = await page.getTextContent();
      // 按 y 坐标分组（容差 3），同组内按 x 排序
      const rows = new Map();
      tc.items.forEach((it) => {
        if (!it.str) return;
        const y = Math.round(it.transform[5] / 3);
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y).push(it);
      });
      const ys = Array.from(rows.keys()).sort((a, b) => b - a);
      ys.forEach((y) => {
        const row = rows.get(y).sort((a, b) => a.transform[4] - b.transform[4]);
        const text = row.map((r) => r.str).join('').replace(/\s+/g, ' ').trim();
        if (text) lines.push(text);
      });
      setProgress(Math.round((n / doc.numPages) * 100));
    }

    await doc.destroy();
    return lines;
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setProgress(0);
    try {
      const lines = await extractLines();
      if (!lines.length) {
        setError('未能从该 PDF 提取到文字（可能是扫描件/纯图片 PDF，需要 OCR）');
        return;
      }
      const doc = new Document({
        sections: [
          {
            children: lines.map((t) => new Paragraph({ children: [new TextRun(t)] })),
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      const name = `${safeName(stripExt(file.name))}.docx`;
      setResult({ name, size: blob.size, lines: lines.length });
      setPreview(lines.slice(0, 3).join('\n'));
      downloadBlob(blob, name);
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
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('wf')?.click()}
      >
        <input id="wf" type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传PDF转Word'}</p>
      </div>

      <button onClick={convert} disabled={!file || busy} className={BTN_PRIMARY}>
        {busy ? `转换中 ${progress}%` : '转换为Word'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">转换成功！已开始下载</div>
          <div className="text-sm text-gray-500 mt-1">
            提取 {result.lines} 段文字 · {fmtSize(result.size)}
          </div>
          {preview && (
            <div className="mt-3 text-left text-xs text-gray-500 bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 whitespace-pre-wrap break-words">
              {preview}
              {result.lines > 3 ? '\n…' : ''}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            说明：导出的是文字内容（.docx），原始版式与图片不会保留。
          </p>
        </div>
      )}
    </div>
  );
}
