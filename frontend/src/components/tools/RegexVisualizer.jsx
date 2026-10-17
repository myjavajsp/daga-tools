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
      {/* min-w-0 是给中间那个 input 的：flex-1 只写了 flex-basis，
          没关 min-width:auto，而 <input> 自带 size=20 的最小内容宽度，
          375px 视口下整行顶出容器 6px（实测文档 scrollWidth 366 / 可视 360）。 */}
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1 px-3 py-2 bg-surface-2 rounded-l-lg border border-r-0 border-line-2">
          <span className="text-ink-3">/</span>
        </div>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="输入正则表达式..."
          className="flex-1 min-w-0 px-4 py-2 bg-paper border border-line rounded-r-lg text-ink font-mono focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
        <button onClick={testRegex} className="btn-a px-6">
          测试
        </button>
      </div>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">{error}</div>
      )}

      {parts.length > 0 && (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-ink-2 mb-2">正则结构</div>
            <div className="flex flex-wrap gap-1 p-4 bg-paper rounded-card">
              {parts.map((part, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-sm font-mono ${
                    part.type === 'quantifier' ? 'bg-warning-soft text-warning' :
                    part.type === 'charClass' ? 'bg-accent-soft text-accent' :
                    part.type === 'group' ? 'bg-accent-soft text-accent' :
                    'bg-surface-2 text-ink-2'
                  }`}
                  title={quantifierMeaning[part.value] || ''}
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-ink-2 mb-2">
              匹配结果 ({matchCount} 个匹配)
            </div>
            <div className="p-4 bg-paper rounded-card font-mono text-sm break-all">
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
                return <span key={i} className={matched ? 'bg-success-soft text-success rounded' : 'text-ink-2'}>{char}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-paper rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">常用符号说明</div>
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
            <div key={sym} className="flex justify-between px-2 py-1 bg-surface rounded">
              <code className="font-mono text-accent">{sym}</code>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
