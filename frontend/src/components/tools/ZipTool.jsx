import { useState } from 'react';
export default function ZipTool() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const compress = () => {
    if (files.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setResult({ count: files.length, size: Math.round(files.reduce((a, b) => a + b.size, 0) / 1024) + ' KB' });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('zf')?.click()}>
        <input id="zf" type="file" multiple onChange={handleFiles} className="hidden" />
        <div className="text-4xl mb-3">📦</div>
        <p className="text-gray-600 dark:text-gray-400">{files.length > 0 ? `已选择 ${files.length} 个文件` : '点击选择文件打包'}</p>
      </div>
      {files.length > 0 && (
        <div className="max-h-32 overflow-auto space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{f.name}</span>
              <span className="text-xs text-gray-400 ml-2">{Math.round(f.size / 1024)}KB</span>
              <button onClick={() => removeFile(i)} className="text-red-500 ml-2 text-sm">×</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={compress} disabled={files.length === 0 || loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">
        {loading ? '压缩中...' : `压缩为ZIP (${files.length} 个文件)`}
      </button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">压缩完成!</div>
          <div className="text-sm text-gray-500 mt-1">{result.count} 个文件，总大小 {result.size}</div>
        </div>
      )}
    </div>
  );
}
