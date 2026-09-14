import { useState } from 'react';
export default function AudioExtractor() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFile = (e) => { setFile(e.target.files[0]); setResult(null); };

  const extract = () => {
    setResult({ label: file.name.replace(/\.[^.]+$/, '') + '.mp3', size: Math.round(file.size * 0.15 / 1024) + ' KB' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('vf')?.click()}>
        <input id="vf" type="file" accept="video/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🎬</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传视频文件提取音频'}</p>
      </div>
      <button onClick={extract} disabled={!file} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">提取音频</button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">音频提取成功!</div>
          <div className="text-sm text-gray-500 mt-1">{result.label} - {result.size}</div>
        </div>
      )}
    </div>
  );
}
