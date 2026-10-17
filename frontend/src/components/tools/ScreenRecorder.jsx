import { useState, useRef, useEffect } from 'react';

export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState(null);
  /* recorder 必须放在 ref 里：放 state 会每次推流都整个组件重渲染一遍。
     原来还有个 mediaRecorderRef 建了没用、stop 时只清 timer 不调 recorder.stop()，
     于是 onstop 永远不触发 —— 点「停止录制」后既没有预览也没有下载。 */
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const parts = [];
      recorder.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
      recorder.onstop = () => {
        const url = URL.createObjectURL(new Blob(parts, { type: recorder.mimeType || 'video/webm' }));
        setUrls([url]);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      // 用户在浏览器顶栏点「停止分享」时也要收束计时器和按钮状态
      stream.getVideoTracks()[0]?.addEventListener('ended', stopRecording);
      recorderRef.current = recorder;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (e) {
      setRecording(false);
      setError(e?.name === 'NotAllowedError' ? '没有获得录屏权限，请在浏览器弹窗里重新选择' : '当前浏览器不支持屏幕录制');
    }
  };

  function stopRecording() {
    clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setRecording(false);
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full border border-line-2 flex items-center justify-center flex-none">
          <span className={`w-4 h-4 rounded-full ${recording ? 'bg-danger' : 'bg-line-2'}`} />
        </div>
        <div>
          <div className="mono text-2xl font-bold text-ink leading-none">{formatTime(duration)}</div>
          <div className="text-sm text-ink-3 mt-1">{recording ? '正在录制屏幕' : urls.length ? '录制完成' : '准备录制'}</div>
        </div>
      </div>

      {error && <p className="text-sm bg-danger-soft text-danger rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        {!recording ? (
          <button onClick={startRecording} className="btn-a flex-1">开始录制</button>
        ) : (
          <button onClick={stopRecording} className="btn-a danger flex-1 min-h-10 transition-colors">停止录制</button>
        )}
      </div>

      {urls.length > 0 && !recording && (
        <div className="space-y-3">
          <video src={urls[0]} controls className="w-full rounded-card border border-line max-h-80 bg-black" />
          <a href={urls[0]} download="recording.webm" className="btn-a w-full">下载录屏（WebM）</a>
        </div>
      )}
    </div>
  );
}
