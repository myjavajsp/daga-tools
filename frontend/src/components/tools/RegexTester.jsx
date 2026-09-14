import { useState } from 'react';
export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testStr, setTestStr] = useState('Hello world! Hello everyone!');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const testRegex = () => {
    try {
      setError('');
      const regex = new RegExp(pattern, flags);
      const allMatches = [...testStr.matchAll(regex)];
      setMatches(allMatches.map(m => ({ match: m[0], index: m.index, groups: m.slice(1) })));
    } catch (e) {
      setError(e.message);
      setMatches([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600">
          <span className="text-gray-500">/</span>
        </div>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="输入正则表达式..."
          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-r-lg text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <div className="flex gap-1">
          {['g', 'i', 'm'].map(f => (
            <button
              key={f}
              onClick={() => setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)}
              className={`px-2 py-1 text-xs font-mono rounded-lg transition-colors ${
                flags.includes(f)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={testRegex}
          disabled={!pattern}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
        >
          测试
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">测试文本</label>
        <textarea
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">找到 {matches.length} 个匹配</div>
          {matches.map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm">
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-mono">#{i + 1}</span>
              <code className="font-mono text-green-600 dark:text-green-400">{m.match}</code>
              <span className="text-xs text-gray-400">位置: {m.index}</span>
              {m.groups.length > 0 && (
                <span className="text-xs text-gray-500">组: [{m.groups.join(', ')}]</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">常用正则</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: '邮箱', val: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ },
            { label: '手机号', val: /^1[3-9]\\d{9}$/ },
            { label: 'URL', val: /^https?:\/\/[^\s]+$/ },
            { label: '身份证', val: /^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$/ },
          ].map(({ label, val }) => (
            <button
              key={label}
              onClick={() => { setPattern(val.source); setFlags('g'); }}
              className="text-left px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-700 dark:text-gray-300"
            >
              {label}: <code className="text-xs">{val.source}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
