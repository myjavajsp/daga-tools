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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文本（每行一条）</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要排序的文本，每行一条..."
          className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
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
            className={`py-2 rounded-xl text-sm font-medium transition-all ${
              method === id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={handleSort}
        disabled={!input.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        排序
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">结果</label>
            <button
              onClick={copyOutput}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none"
          />
        </div>
      )}
    </div>
  );
}
