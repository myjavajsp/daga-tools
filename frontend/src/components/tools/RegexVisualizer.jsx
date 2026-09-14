import { useState } from 'react';
export default function RegexVisualizer() {
  const [pattern, setPattern] = useState('[a-z]+');
  const [flags, setFlags] = useState('g');
  const [testStr] = useState('Hello World hello world');
  const [error, setError] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [parts, setParts] = useState([]);

  const testRegex = () => {
    try {
      setError('');
      const regex = new RegExp(pattern, flags);
      const matches = [...testStr.matchAll(regex)];
      setMatchCount(matches.length);
      
      // Visualize the pattern parts
      const parsed = parseRegex(pattern);
      setParts(parsed);
    } catch (e) {
      setError(e.message);
      setParts([]);
    }
  };

  const parseRegex = (pattern) => {
    const parts = [];
    let i = 0;
    while (i < pattern.length) {
      if (pattern[i] === '\\') {
        parts.push({ type: 'escape', value: pattern.substring(i, i + 2), literal: pattern[i + 1] });
        i += 2;
      } else if (pattern[i] === '[') {
        const end = pattern.indexOf(']', i);
        parts.push({ type: 'charClass', value: pattern.substring(i, end + 1) });
        i = end + 1;
      } else if (pattern[i] === '(') {
        const end = pattern.indexOf(')', i);
        parts.push({ type: 'group', value: pattern.substring(i, end + 1) });
        i = end + 1;
      } else if ('*+?|^$.{}'.includes(pattern[i])) {
        parts.push({ type: 'quantifier', value: pattern[i] });
        i++;
      } else {
        parts.push({ type: 'literal', value: pattern[i] });
        i++;
      }
    }
    return parts;
  };

  const quantifierMeaning = {
    '*': '零次或多次',
    '+': '一次或多次',
    '?': '零次或一次',
    '{2}': '恰好2次',
    '{2,}': '至少2次',
    '{2,5}': '2到5次',
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
        <button onClick={testRegex} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl">
          测试
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      {parts.length > 0 && (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">正则结构</div>
            <div className="flex flex-wrap gap-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              {parts.map((part, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-sm font-mono ${
                    part.type === 'quantifier' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                    part.type === 'charClass' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                    part.type === 'group' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                  title={quantifierMeaning[part.value] || ''}
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              匹配结果 ({matchCount} 个匹配)
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono text-sm break-all">
              {testStr.split('').map((char, i) => {
                const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
                const matches = [...testStr.matchAll(regex)];
                let matched = false;
                for (const m of matches) {
                  if (i >= m.index && i < m.index + m[0].length) {
                    matched = true;
                    break;
                  }
                }
                return <span key={i} className={matched ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded' : 'text-gray-700 dark:text-gray-300'}>{char}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">常用符号说明</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { sym: '. ', desc: '匹配任意字符' },
            { sym: '^', desc: '匹配开头' },
            { sym: '$', desc: '匹配结尾' },
            { sym: '*+?', desc: '量词' },
            { sym: '[abc]', desc: '字符集合' },
            { sym: '(abc)', desc: '捕获组' },
            { sym: '\\d', desc: '数字 [0-9]' },
            { sym: '\\w', desc: '单词字符' },
            { sym: '\\s', desc: '空白字符' },
            { sym: '|', desc: '或者' },
          ].map(({ sym, desc }) => (
            <div key={sym} className="flex justify-between px-2 py-1 bg-white dark:bg-gray-800 rounded">
              <code className="font-mono text-blue-600 dark:text-blue-400">{sym}</code>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
