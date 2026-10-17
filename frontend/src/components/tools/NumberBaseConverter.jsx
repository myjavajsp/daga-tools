import { useState } from 'react';
export default function NumberBaseConverter() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [error, setError] = useState('');

  const results = {};
  if (input.trim()) {
    try {
      const dec = parseInt(input, fromBase);
      if (isNaN(dec)) throw new Error();
      results[2] = dec.toString(2);
      results[8] = dec.toString(8);
      results[10] = dec.toString(10);
      results[16] = dec.toString(16).toUpperCase();
      setError('');
    } catch {
      setError('无法解析，请检查输入');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">输入数值</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入数字..."
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink font-mono focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>
      <div>
        <label className="lbl">进制</label>
        <select
          value={fromBase}
          onChange={(e) => setFromBase(Number(e.target.value))}
          className="input w-full"
        >
          {[2, 8, 10, 16].map(b => <option key={b} value={b}>{b}进制</option>)}
        </select>
      </div>
      {error && <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">{error}</div>}
      {Object.keys(results).length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(results).map(([base, val]) => (
            <div key={base} className="bg-paper rounded-card p-3">
              <div className="text-xs text-ink-3 mb-1">{base}进制</div>
              <code className="text-sm font-mono text-ink break-all">{val}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
