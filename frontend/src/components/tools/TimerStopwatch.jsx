import { useState, useRef, useEffect } from 'react';
export default function TimerStopwatch() {
  const [mode, setMode] = useState('stopwatch');
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);

  const formatTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(centis).padStart(2,'0')}`;
  };

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => setTime(Date.now() - startTimeRef.current), 10);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => setRunning(true);
  const stop = () => { setRunning(false); clearInterval(intervalRef.current); };
  const reset = () => { stop(); setTime(0); setLaps([]); };
  const lap = () => { if (running) setLaps(prev => [time, ...prev]); };

  if (mode === 'countdown') {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(5);
    const [seconds, setSeconds] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [countdownRunning, setCountdownRunning] = useState(false);
    const cdRef = useRef(null);
    const cdStartRef = useRef(0);

    useEffect(() => {
      if (countdownRunning && remaining > 0) {
        cdStartRef.current = Date.now() - (total - remaining);
        cdRef.current = setInterval(() => setRemaining(Math.max(0, total - (Date.now() - cdStartRef.current))), 10);
      }
      return () => clearInterval(cdRef.current);
    }, [countdownRunning]);

    const total = hours * 3600000 + minutes * 60000 + seconds * 1000;

    return (
      <div className="space-y-6">
        <div className="flex gap-2 justify-center">
          {[{id:'stopwatch',label:'秒表'},{id:'countdown',label:'倒计时'}].map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);reset()}} className={`px-6 py-2 rounded-xl font-medium transition-all ${mode===m.id?'bg-gradient-to-r from-blue-500 to-purple-500 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{m.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-gray-500 text-center mb-1">时</label><input type="number" min="0" max="99" value={hours} onChange={e=>setHours(Number(e.target.value))} className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-gray-900 dark:text-white text-lg" /></div>
          <div><label className="block text-xs text-gray-500 text-center mb-1">分</label><input type="number" min="0" max="59" value={minutes} onChange={e=>setMinutes(Number(e.target.value))} className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-gray-900 dark:text-white text-lg" /></div>
          <div><label className="block text-xs text-gray-500 text-center mb-1">秒</label><input type="number" min="0" max="59" value={seconds} onChange={e=>setSeconds(Number(e.target.value))} className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-gray-900 dark:text-white text-lg" /></div>
        </div>
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">{formatTime(total - remaining)}</div>
        </div>
        <div className="flex gap-3">
          {remaining > 0 ? (
            <button onClick={()=>setCountdownRunning(!countdownRunning)} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl">{countdownRunning?'暂停':'开始'}</button>
          ) : (
            <button onClick={()=>{setRemaining(total);setCountdownRunning(true);}} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl">开始</button>
          )}
          <button onClick={()=>{setCountdownRunning(false);setRemaining(0);}} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl">重置</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        {[{id:'stopwatch',label:'秒表'},{id:'countdown',label:'倒计时'}].map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);reset()}} className={`px-6 py-2 rounded-xl font-medium transition-all ${mode===m.id?'bg-gradient-to-r from-blue-500 to-purple-500 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{m.label}</button>
        ))}
      </div>
      <div className="text-center">
        <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">{formatTime(time)}</div>
      </div>
      <div className="flex gap-3">
        {!running ? (
          <button onClick={start} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg">开始</button>
        ) : (
          <button onClick={stop} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg">暂停</button>
        )}
        <button onClick={lap} disabled={!running} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl disabled:opacity-50">计圈</button>
        <button onClick={reset} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl">重置</button>
      </div>
      {laps.length > 0 && (
        <div className="max-h-48 overflow-auto space-y-1">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
              <span className="text-gray-500">第{i+1}圈</span>
              <code className="font-mono text-gray-900 dark:text-white">{formatTime(l)}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
