import { useState } from 'react';
export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('toTimestamp');

  const toTimestamp = () => {
    try {
      setError('');
      const d = new Date(input);
      if (isNaN(d.getTime())) throw new Error('无效日期');
      setResult({
        timestamp: Math.floor(d.getTime() / 1000),
        ms: d.getTime(),
        iso: d.toISOString(),
        local: d.toLocaleString('zh-CN'),
        unix: Math.floor(d.getTime() / 1000),
      });
    } catch (e) {
      setError(e.message);
      setResult(null);
    }
  };

  const fromTimestamp = () => {
    try {
      setError('');
      const ts = Number(input);
      if (isNaN(ts)) throw new Error('请输入数字');
      const d = new Date(ts * 1000);
      setResult({
        timestamp: ts,
        ms: ts * 1000,
        iso: d.toISOString(),
        local: d.toLocaleString('zh-CN'),
        unix: ts,
      });
    } catch (e) {
      setError(e.message);
      setResult(null);
    }
  };

  const now = () => {
    setInput(Math.floor(Date.now() / 1000).toString());
    setMode('fromTimestamp');
  };

  const copyResult = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('toTimestamp'); setResult(null); }}
          className={`flex-1 py-2 rounded-card text-sm font-medium transition-all ${
            mode === 'toTimestamp' ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'
          }`}
        >
          日期 → 时间戳
        </button>
        <button
          onClick={() => { setMode('fromTimestamp'); setResult(null); }}
          className={`flex-1 py-2 rounded-card text-sm font-medium transition-all ${
            mode === 'fromTimestamp' ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'
          }`}
        >
          时间戳 → 日期
        </button>
      </div>

      <div>
        <label className="lbl">
          {mode === 'toTimestamp' ? '日期时间' : 'Unix 时间戳'}
        </label>
        <div className="flex gap-2">
          <input
            type={mode === 'toTimestamp' ? 'datetime-local' : 'number'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'toTimestamp' ? '选择日期时间' : '输入时间戳...'}
            className="flex-1 px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
          {mode === 'fromTimestamp' && (
            <button onClick={now} className="px-4 py-3 bg-surface-2 rounded-card text-sm text-ink-2 hover:bg-surface-3">
              现在
            </button>
          )}
        </div>
      </div>

      <button
        onClick={mode === 'toTimestamp' ? toTimestamp : fromTimestamp}
        disabled={!input}
        className="btn-a w-full transition-colors"
      >
        转换
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">{error}</div>
      )}

      {result && (
        <div className="space-y-2">
          {[
            { label: 'Unix 时间戳（秒）', value: result.timestamp, key: 'unix' },
            { label: '毫秒时间戳', value: result.ms, key: 'ms' },
            { label: 'ISO 8601', value: result.iso, key: 'iso' },
            { label: '本地时间', value: result.local, key: 'local' },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center justify-between bg-paper rounded-card p-3">
              <span className="text-sm text-ink-2">{label}</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-ink">{value}</code>
                <button onClick={() => copyResult(String(value))} className="act">复制</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
