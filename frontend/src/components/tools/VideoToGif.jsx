import { useState } from 'react';
export default function VideoToGif() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(3);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const convert = () => {
    // Demo - would use FFmpeg.wasm in production
    setResult({ url: preview, label: 'demo.gif' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('vf')?.click()}>
        <input id="vf" type="file" accept="video/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🎬</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换视频' : '上传视频文件'}</p>
      </div>

      {preview && (
        <>
          <video src={preview} controls className="w-full rounded-xl max-h-64" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">起始时间(秒)</label>
              <input type="number" value={start} onChange={e => setStart(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">时长(秒)</label>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
            </div>
          </div>
          <button onClick={convert} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">转换为GIF</button>
          {result && (
            <div className="text-center">
              <img src={result.url} alt="GIF" className="mx-auto rounded-xl max-h-48 mb-3" />
              <a href={result.url} download={result.label} className="inline-block px-6 py-2 bg-green-500 text-white rounded-xl font-medium">下载GIF</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
