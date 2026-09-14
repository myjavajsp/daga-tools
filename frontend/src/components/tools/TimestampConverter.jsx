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
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'toTimestamp' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          日期 → 时间戳
        </button>
        <button
          onClick={() => { setMode('fromTimestamp'); setResult(null); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'fromTimestamp' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          时间戳 → 日期
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === 'toTimestamp' ? '日期时间' : 'Unix 时间戳'}
        </label>
        <div className="flex gap-2">
          <input
            type={mode === 'toTimestamp' ? 'datetime-local' : 'number'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'toTimestamp' ? '选择日期时间' : '输入时间戳...'}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {mode === 'fromTimestamp' && (
            <button onClick={now} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200">
              现在
            </button>
          )}
        </div>
      </div>

      <button
        onClick={mode === 'toTimestamp' ? toTimestamp : fromTimestamp}
        disabled={!input}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        转换
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <div className="space-y-2">
          {[
            { label: 'Unix 时间戳（秒）', value: result.timestamp, key: 'unix' },
            { label: '毫秒时间戳', value: result.ms, key: 'ms' },
            { label: 'ISO 8601', value: result.iso, key: 'iso' },
            { label: '本地时间', value: result.local, key: 'local' },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-gray-900 dark:text-white">{value}</code>
                <button onClick={() => copyResult(String(value))} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
