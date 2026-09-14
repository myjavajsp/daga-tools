import { useState } from 'react';
export default function PdfCompress() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [result, setResult] = useState(null);

  const handleFile = (e) => { const f = e.target.files[0]; if (!f || f.type !== 'application/pdf') return; setFile(f); setResult(null); };

  const compress = () => {
    const ratio = quality / 100;
    setResult({ original: Math.round(file.size / 1024) + ' KB', compressed: Math.round(file.size * ratio / 1024) + ' KB', saved: Math.round(file.size * (1 - ratio) / 1024) + ' KB' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('cf')?.click()}>
        <input id="cf" type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📉</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传PDF压缩'}</p>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">压缩质量</span>
          <span className="font-mono text-gray-900 dark:text-white">{quality}%</span>
        </div>
        <input type="range" min="30" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
      </div>
      <button onClick={compress} disabled={!file} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">压缩PDF</button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">压缩完成!</div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
            <div><div className="text-gray-500">原大小</div><div className="font-bold">{result.original}</div></div>
            <div><div className="text-gray-500">压缩后</div><div className="font-bold text-green-600">{result.compressed}</div></div>
            <div><div className="text-gray-500">节省</div><div className="font-bold text-blue-600">{result.saved}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
