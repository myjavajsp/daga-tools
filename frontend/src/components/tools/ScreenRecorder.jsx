import { useState } from 'react';
export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [chunks, setChunks] = useState([]);
  const mediaRecorderRef = useState(null)[1];
  const timerRef = useState(null)[1];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setChunks([url]);
      };
      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    chunks.forEach(c => c.stop?.());
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-24 h-24 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <div className={`w-12 h-12 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
        </div>
        <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mb-2">
          {formatTime(duration)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {recording ? '录制中...' : '准备录制'}
        </div>
      </div>
      <div className="flex gap-3">
        {!recording ? (
          <button onClick={startRecording} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">开始录制</button>
        ) : (
          <button onClick={stopRecording} className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all">停止录制</button>
        )}
      </div>
      {chunks.length > 0 && !recording && (
        <div className="space-y-3">
          <video src={chunks[0]} controls className="w-full rounded-xl max-h-64" />
          <a href={chunks[0]} download="recording.webm" className="block text-center py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600">下载录屏</a>
        </div>
      )}
    </div>
  );
}
