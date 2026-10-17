import { useState } from 'react';
export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState([]);

  const findDiff = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      const l1 = lines1[i] || '';
      const l2 = lines2[i] || '';
      if (l1 !== l2) {
        result.push({ line: i + 1, text1: l1, text2: l2, diff: true });
      } else {
        result.push({ line: i + 1, text1: l1, text2: l2, diff: false });
      }
    }
    setDiff(result);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="lbl">原文</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="输入原始文本..."
            className="w-full h-48 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft resize-none"
          />
        </div>
        <div>
          <label className="lbl">修改后</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="输入修改后的文本..."
            className="w-full h-48 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft resize-none"
          />
        </div>
      </div>

      <button
        onClick={findDiff}
        disabled={!text1.trim() || !text2.trim()}
        className="btn-a w-full transition-colors"
      >
        对比差异
      </button>

      {diff.length > 0 && (
        <div className="max-h-96 overflow-auto border border-line rounded-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper">
                <th className="px-3 py-2 text-left text-xs font-medium text-ink-3">行号</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-ink-3">原文</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-ink-3">修改后</th>
              </tr>
            </thead>
            <tbody>
              {diff.map(({ line, text1, text2, diff: isDiff }) => (
                <tr
                  key={line}
                  className={
                    isDiff
                      ? 'bg-danger-soft'
                      : line % 2 === 0
                      ? 'bg-paper'
                      : 'bg-surface'
                  }
                >
                  <td className="px-3 py-2 text-xs text-ink-3 font-mono">{line}</td>
                  <td className={`px-3 py-2 font-mono ${isDiff ? 'text-danger line-through' : 'text-ink-2'}`}>
                    {text1 || '（空）'}
                  </td>
                  <td className={`px-3 py-2 font-mono ${isDiff ? 'text-success' : 'text-ink-2'}`}>
                    {text2 || '（空）'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
