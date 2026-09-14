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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原文</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="输入原始文本..."
            className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">修改后</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="输入修改后的文本..."
            className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>
      </div>

      <button
        onClick={findDiff}
        disabled={!text1.trim() || !text2.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        对比差异
      </button>

      {diff.length > 0 && (
        <div className="max-h-96 overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">行号</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">原文</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">修改后</th>
              </tr>
            </thead>
            <tbody>
              {diff.map(({ line, text1, text2, diff: isDiff }) => (
                <tr
                  key={line}
                  className={
                    isDiff
                      ? 'bg-red-50 dark:bg-red-900/10'
                      : line % 2 === 0
                      ? 'bg-gray-50 dark:bg-gray-800/50'
                      : 'bg-white dark:bg-gray-900'
                  }
                >
                  <td className="px-3 py-2 text-xs text-gray-400 font-mono">{line}</td>
                  <td className={`px-3 py-2 font-mono ${isDiff ? 'text-red-600 dark:text-red-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                    {text1 || '（空）'}
                  </td>
                  <td className={`px-3 py-2 font-mono ${isDiff ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
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
