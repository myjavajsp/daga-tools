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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入数值</label>
        <input
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="输入数字..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">进制</label>
          <select
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {BASES.map(b => <option key={b} value={b}>{b}进制</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目标进制</label>
          <select
            value={toBase}
            onChange={(e) => setToBase(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {BASES.filter(b => b !== fromBase).map(b => <option key={b} value={b}>{b}进制</option>)}
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      {input.trim() && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(results).map(([base, val]) => (
            <div key={base} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{base}进制</div>
              <code className="text-sm font-mono text-gray-900 dark:text-white break-all">{val}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
