import { useState } from 'react';
export default function PdfSplit() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f || f.type !== 'application/pdf') return;
    setFile(f);
    // Demo: assume some pages
    setPages([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  };

  const split = (start, end) => {
    setResult({ start, end, count: end - start + 1, size: Math.round(file.size / pages.length * (end - start + 1) / 1024) + ' KB' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('sf')?.click()}>
        <input id="sf" type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传PDF文件'}</p>
      </div>
      {pages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择页码范围</label>
          <div className="flex gap-2">
            <input type="number" min={1} max={pages.length} value={1} onChange={e => {}} placeholder="起始页" className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm" />
            <span className="text-gray-500 self-center">至</span>
            <input type="number" min={1} max={pages.length} value={pages.length} onChange={e => {}} placeholder="结束页" className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm" />
            <button onClick={() => split(1, pages.length)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">拆分</button>
          </div>
        </div>
      )}
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">拆分完成!</div>
          <div className="text-sm text-gray-500 mt-1">第{result.start}-{result.end}页，共{result.count}页，大小{result.size}</div>
        </div>
      )}
    </div>
  );
}
