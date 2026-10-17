import { useState } from 'react';
export default function TextSort() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [method, setMethod] = useState('asc');
  const [copied, setCopied] = useState(false);

  const handleSort = () => {
    const lines = input.split('\n').filter(l => l.trim());
    let sorted = [...lines];
    if (method === 'asc') sorted.sort((a, b) => a.localeCompare(b, 'zh'));
    else if (method === 'desc') sorted.sort((a, b) => b.localeCompare(a, 'zh'));
    else if (method === 'length') sorted.sort((a, b) => a.length - b.length);
    else if (method === 'random') sorted.sort(() => Math.random() - 0.5);
    setOutput(sorted.join('\n'));
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">文本（每行一条）</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要排序的文本，每行一条..."
          className="w-full h-48 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft resize-none"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { id: 'asc', label: '升序' },
          { id: 'desc', label: '降序' },
          { id: 'length', label: '按长度' },
          { id: 'random', label: '随机' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            className={`py-2 rounded-card text-sm font-medium transition-all ${
              method === id
                ? 'bg-accent text-accent-fg'
                : 'bg-surface-2 text-ink-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={handleSort}
        disabled={!input.trim()}
        className="btn-a w-full transition-colors"
      >
        排序
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lbl">结果</label>
            <button
              onClick={copyOutput}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                copied
                  ? 'bg-success-soft text-success'
                  : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
              }`}
            >
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-48 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none"
          />
        </div>
      )}
    </div>
  );
}
