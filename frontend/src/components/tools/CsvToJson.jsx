import { useState } from 'react';
export default function CsvToJson() {
  const [input, setInput] = useState('name,age,city\n张三,25,北京\n李四,30,上海\n王五,28,广州');
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = () => {
    try {
      setError('');
      const lines = input.trim().split('\n');
      if (lines.length < 2) { setError('至少需要表头和一行数据'); return; }
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] ?? '');
        return obj;
      });
      setJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setError('转换失败: ' + e.message);
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CSV 输入</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JSON 输出</label>
          {json && <button onClick={copyJson} className="text-xs text-blue-500 hover:text-blue-600">{copied ? '已复制!' : '复制'}</button>}
        </div>
        <textarea
          value={json}
          readOnly
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none font-mono text-sm"
        />
      </div>
      <button onClick={convert} disabled={!input.trim()} className="self-start px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">
        转换
      </button>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm">{error}</div>}
    </div>
  );
}
