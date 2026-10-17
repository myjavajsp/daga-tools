import { useEffect, useRef, useState } from 'react';
import Icon from '../Icons';

const pad = (n, w = 2) => String(n).padStart(w, '0');

// 00:00:00.00
function format(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const c = Math.floor((ms % 1000) / 10);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(c)}`;
}

const MODES = [
  { id: 'stopwatch', label: '秒表' },
  { id: 'countdown', label: '倒计时' },
];

function ModeTabs({ mode, onChange }) {
  return (
    <div className="flex justify-center gap-2">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          aria-pressed={mode === m.id}
          className={
            'min-h-10 rounded-sm px-5 text-sm font-medium transition-colors ' +
            (mode === m.id ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2 hover:bg-accent-soft hover:text-accent-press')
          }
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* 大字计时读数：旧版写死 text-6xl（60px）的 11 个等宽字符，
   实测在 360px 宽下撑到 433px，整页横向溢出。改成随屏缩。 */
function Readout({ value }) {
  return (
    <div className="mono text-center text-[10vw] leading-tight font-bold tabular-nums text-ink sm:text-5xl md:text-6xl">
      {value}
    </div>
  );
}

/**
 * 秒表与倒计时是两个独立组件。
 * 旧版把倒计时的 useState/useEffect 写在 `if (mode === 'countdown') { ... }` 里面，
 * 切换回秒表时 hook 数量变少，React 会直接抛
 * "Rendered fewer hooks than expected" 白屏。
 */
function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const tickRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    startRef.current = Date.now() - time;
    tickRef.current = setInterval(() => setTime(Date.now() - startRef.current), 10);
    return () => clearInterval(tickRef.current);
    // 只在启停时重建基准，time 每 10ms 变一次，放进依赖会每帧重挂 interval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = () => { setRunning(false); setTime(0); setLaps([]); };
  const lap = () => { if (running) setLaps((prev) => [time, ...prev]); };

  return (
    <div className="space-y-6">
      <Readout value={format(time)} />
      <div className="flex gap-3">
        <button onClick={() => setRunning((v) => !v)} className="btn-a flex-1">
          <Icon name={running ? 'up' : 'play'} />
          {running ? '暂停' : '开始'}
        </button>
        <button onClick={lap} disabled={!running} className="btn-ghost">计圈</button>
        <button onClick={reset} className="btn-ghost">重置</button>
      </div>
      {laps.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-auto">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between rounded-sm bg-surface-2 px-4 py-2 text-sm">
              <span className="text-ink-3">第 {laps.length - i} 圈</span>
              <code className="mono text-ink">{format(l)}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Countdown() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const tickRef = useRef(null);
  const startRef = useRef(0);

  const total = hours * 3600000 + minutes * 60000 + seconds * 1000;

  useEffect(() => {
    if (!running || remaining <= 0) return undefined;
    startRef.current = Date.now() - (total - remaining);
    tickRef.current = setInterval(() => {
      const left = total - (Date.now() - startRef.current);
      if (left <= 0) { setRemaining(0); setRunning(false); clearInterval(tickRef.current); }
      else setRemaining(left);
    }, 10);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const fields = [
    { label: '时', value: hours, set: setHours, max: 99 },
    { label: '分', value: minutes, set: setMinutes, max: 59 },
    { label: '秒', value: seconds, set: setSeconds, max: 59 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="lbl text-center">{f.label}</label>
            <input
              type="number"
              min="0"
              max={f.max}
              value={f.value}
              onChange={(e) => f.set(Math.max(0, Math.min(f.max, Number(e.target.value) || 0)))}
              className="input mono text-center"
            />
          </div>
        ))}
      </div>
      <Readout value={format(Math.max(0, remaining > 0 ? remaining : total))} />
      <div className="flex gap-3">
        {remaining > 0 ? (
          <button onClick={() => setRunning((v) => !v)} className="btn-a flex-1">
            <Icon name={running ? 'up' : 'play'} />
            {running ? '暂停' : '继续'}
          </button>
        ) : (
          <button
            onClick={() => { if (total > 0) { setRemaining(total); setRunning(true); } }}
            disabled={total === 0}
            className="btn-a flex-1"
          >
            <Icon name="play" />
            开始
          </button>
        )}
        <button onClick={() => { setRunning(false); setRemaining(0); }} className="btn-ghost">重置</button>
      </div>
    </div>
  );
}

export default function TimerStopwatch() {
  const [mode, setMode] = useState('stopwatch');
  return (
    <div className="space-y-6">
      <ModeTabs mode={mode} onChange={setMode} />
      {mode === 'countdown' ? <Countdown /> : <Stopwatch />}
    </div>
  );
}
