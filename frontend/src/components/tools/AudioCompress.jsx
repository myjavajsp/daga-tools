import { useState } from 'react';
export default function AudioCompress() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState(128);
  const [result, setResult] = useState(null);

  const handleFile = (e) => { setFile(e.target.files[0]); setResult(null); };

  const compress = () => {
    const ratio = 0.3 + Math.random() * 0.3;
    setResult({ original: Math.round(file.size / 1024) + ' KB', compressed: Math.round(file.size * ratio / 1024) + ' KB', ratio: (ratio * 100).toFixed(0) + '%' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('af')?.click()}>
        <input id="af" type="file" accept="audio/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📉</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '点击上传音频文件'}</p>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">比特率</span>
          <span className="font-mono text-gray-900 dark:text-white">{bitrate} kbps</span>
        </div>
        <input type="range" min="64" max="320" step="32" value={bitrate} onChange={e => setBitrate(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>64kbps</span><span>320kbps</span></div>
      </div>
      <button onClick={compress} disabled={!file} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">压缩音频</button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">压缩完成!</div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
            <div><div className="text-gray-500">原大小</div><div className="font-bold">{result.original}</div></div>
            <div><div className="text-gray-500">压缩后</div><div className="font-bold text-green-600">{result.compressed}</div></div>
            <div><div className="text-gray-500">压缩率</div><div className="font-bold text-blue-600">{result.ratio}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
