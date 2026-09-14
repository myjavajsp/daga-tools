import { useState } from 'react';
export default function AudioCut() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(60);
  const [duration, setDuration] = useState(60);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(Math.floor(audio.duration));
      setEndTime(audio.duration);
    });
  };

  const cut = () => {
    setResult({ start: startTime, end: endTime, duration: endTime - startTime, label: `片段_${startTime}s-${endTime}s` });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('af')?.click()}>
        <input id="af" type="file" accept="audio/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🎵</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '点击上传音频文件'}</p>
      </div>

      {audioUrl && (
        <>
          <audio src={audioUrl} controls className="w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">开始时间(秒)</label>
              <input type="number" min={0} max={duration} value={startTime} onChange={e => setStartTime(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">结束时间(秒)</label>
              <input type="number" min={startTime} max={duration} value={endTime} onChange={e => setEndTime(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
            </div>
          </div>
          <button onClick={cut} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">裁剪</button>
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
              <div className="text-green-700 dark:text-green-400 font-medium mb-1">裁剪完成</div>
              <div className="text-sm text-gray-500">时长: {result.duration}秒</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
