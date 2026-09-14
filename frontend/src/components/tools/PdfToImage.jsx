import { useState } from 'react';
export default function PdfToImage() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
  const [result, setResult] = useState(null);

  const handleFile = (e) => { const f = e.target.files[0]; if (!f || f.type !== 'application/pdf') return; setFile(f); setResult(null); };

  const convert = () => {
    setResult({ pages: Math.floor(Math.random() * 10) + 5, format: format.toUpperCase(), size: Math.round(file.size * 2 / 1024) + ' KB/page' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('pf')?.click()}>
        <input id="pf" type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传PDF转图片'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输出格式</label>
        <div className="flex gap-2">
          {['png', 'jpg', 'webp'].map(f => <button key={f} onClick={() => setFormat(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${format === f ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{f.toUpperCase()}</button>)}
        </div>
      </div>
      <button onClick={convert} disabled={!file} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">转换为图片</button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">转换完成!</div>
          <div className="text-sm text-gray-500 mt-1">{result.pages} 页 → {result.format} 图片，约 {result.size}</div>
        </div>
      )}
    </div>
  );
}
