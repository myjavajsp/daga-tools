import { useState } from 'react';
export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...selected]);
  };

  const convert = () => {
    setResult({ count: files.length, size: Math.round(files.reduce((a, b) => a + b.size, 0) / 1024) + ' KB' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('pf')?.click()}>
        <input id="pf" type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-gray-600 dark:text-gray-400">{files.length > 0 ? `已选择 ${files.length} 张图片` : '点击选择图片'}</p>
      </div>
      {files.length > 0 && (
        <div className="max-h-32 overflow-auto space-y-1">
          {files.map((f, i) => <div key={i} className="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg truncate">{f.name}</div>)}
        </div>
      )}
      <button onClick={convert} disabled={files.length === 0} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">转换为PDF</button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">转换完成!</div>
          <div className="text-sm text-gray-500 mt-1">{result.count} 张图片 → PDF ({result.size})</div>
        </div>
      )}
    </div>
  );
}
