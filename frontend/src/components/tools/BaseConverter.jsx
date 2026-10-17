import { useState } from 'react';
const BASES = [2, 8, 10, 16];
export default function BaseConverter() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const [error, setError] = useState('');

  const convert = (val, from, to) => {
    try {
      const dec = parseInt(val, from);
      if (isNaN(dec)) throw new Error('无效数字');
      return dec.toString(to).toUpperCase();
    } catch (e) {
      throw e;
    }
  };

  const handleInput = (val) => {
    setInput(val);
    try {
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const results = {};
  try {
    if (input.trim()) {
      const dec = parseInt(input, fromBase);
      if (!isNaN(dec)) {
        BASES.forEach(b => { if (b !== fromBase) results[b] = dec.toString(b).toUpperCase(); });
      }
    }
  } catch (e) {
    // silently handled
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">输入数值</label>
        <input
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="输入数字..."
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink font-mono focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="lbl">进制</label>
          <select
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value))}
            className="input w-full"
          >
            {BASES.map(b => <option key={b} value={b}>{b}进制</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">目标进制</label>
          <select
            value={toBase}
            onChange={(e) => setToBase(Number(e.target.value))}
            className="input w-full"
          >
            {BASES.filter(b => b !== fromBase).map(b => <option key={b} value={b}>{b}进制</option>)}
          </select>
        </div>
      </div>

      {error && <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">{error}</div>}

      {input.trim() && (
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
