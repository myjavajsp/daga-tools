import { useState } from 'react';
import Icon from '../Icons';

const FLAG_LIST = ['g', 'i', 'm'];

const PRESETS = [
  { label: '邮箱', re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { label: '手机号', re: /^1[3-9]\d{9}$/ },
  { label: 'URL', re: /^https?:\/\/[^\s]+$/ },
  { label: '身份证', re: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/ },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testStr, setTestStr] = useState('Hello world! Hello everyone!');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const toggleFlag = (f) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));

  const testRegex = () => {
    try {
      setError('');
      const regex = new RegExp(pattern, flags);
      const allMatches = [...testStr.matchAll(regex)];
      setMatches(allMatches.map((m) => ({ match: m[0], index: m.index, groups: m.slice(1) })));
    } catch (e) {
      setError(e.message);
      setMatches([]);
    }
  };

  const usePreset = (re) => {
    setPattern(re.source);
    setFlags('g');
    setError('');
    setMatches([]);
  };

  return (
    <div className="space-y-5">
      {/* 旧版这一行是不换行的 flex：375px 下斜杠前缀 + 输入框 + 三个 flag + 测试按钮
          一共 439px，整页横向溢出（实测 scrollWidth 439 > 360）。改成窄屏两行堆叠。 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="mono flex h-11 flex-none items-center px-2 text-ink-3">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式..."
            className="input mono min-w-0 flex-1"
          />
          <span className="mono flex h-11 flex-none items-center text-ink-3">/</span>
        </div>
        <div className="flex flex-none items-center gap-2">
          <div className="flex gap-1">
            {FLAG_LIST.map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                aria-pressed={flags.includes(f)}
                className={
                  'mono h-10 w-10 rounded-sm text-xs transition-colors ' +
                  (flags.includes(f)
                    ? 'bg-accent text-accent-fg'
                    : 'bg-surface-2 text-ink-2 hover:bg-accent-soft hover:text-accent-press')
                }
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={testRegex} disabled={!pattern} className="btn-a">
            <Icon name="check" />
            测试
          </button>
        </div>
      </div>

      <div>
        <label className="lbl" htmlFor="rt-text">测试文本</label>
        <textarea
          id="rt-text"
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          className="input mono min-h-32 resize-none"
        />
      </div>

      {error && (
        <div className="rounded-card border border-danger/30 bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2">
          <div className="lbl">找到 {matches.length} 个匹配</div>
          {matches.map((m, i) => (
            <div key={i} className="card flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
              <span className="mono rounded-sm bg-accent-soft px-2 py-0.5 text-xs text-accent-press">
                #{i + 1}
              </span>
              <code className="mono break-all text-success">{m.match}</code>
              <span className="text-xs text-ink-3">位置 {m.index}</span>
              {m.groups.length > 0 && (
                <span className="mono text-xs text-ink-3">组 [{m.groups.join(', ')}]</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card p-4">
        <div className="lbl mb-2">常用正则</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRESETS.map(({ label, re }) => (
            <button
              key={label}
              onClick={() => usePreset(re)}
              className="rounded-sm border border-line bg-surface px-3 py-2 text-left text-xs text-ink-2 transition-colors hover:border-accent hover:bg-accent-soft"
            >
              <span className="font-semibold text-ink">{label}</span>
              <code className="mono mt-1 block break-all text-ink-3">{re.source}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
