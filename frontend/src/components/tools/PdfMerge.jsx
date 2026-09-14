import { useState } from 'react';
export default function PdfMerge() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...selected]);
  };

  const merge = () => {
    setResult({ count: files.length, size: Math.round(files.reduce((a, b) => a + b.size, 0) / 1024) + ' KB' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('mf')?.click()}>
        <input id="mf" type="file" accept=".pdf" multiple onChange={handleFiles} className="hidden" />
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-600 dark:text-gray-400">{files.length > 0 ? `已选择 ${files.length} 个PDF` : '点击选择PDF文件'}</p>
      </div>
      {files.length > 0 && (
        <div className="max-h-32 overflow-auto space-y-1">
          {files.map((f, i) => <div key={i} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg"><span className="truncate">{f.name}</span><span className="text-xs ml-2">{Math.round(f.size / 1024)}KB</span></div>)}
        </div>
      )}
      <button onClick={merge} disabled={files.length < 2} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">合并PDF</button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">合并成功!</div>
          <div className="text-sm text-gray-500 mt-1">共 {result.count} 个文件，大小 {result.size}</div>
        </div>
      )}
    </div>
  );
}
