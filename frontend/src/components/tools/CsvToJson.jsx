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
        <label className="lbl">CSV 输入</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label className="lbl">JSON 输出</label>
          {json && <button onClick={copyJson} className="act">{copied ? '已复制!' : '复制'}</button>}
        </div>
        <textarea
          value={json}
          readOnly
          className="flex-1 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none font-mono text-sm"
        />
      </div>
      <button onClick={convert} disabled={!input.trim()} className="btn-a self-start px-6 transition-colors">
        转换
      </button>
      {error && <div className="bg-danger-soft border border-line rounded-card p-3 text-danger text-sm">{error}</div>}
    </div>
  );
}
