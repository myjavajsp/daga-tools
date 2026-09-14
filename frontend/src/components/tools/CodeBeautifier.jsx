import { useState } from 'react';
export default function CodeBeautifier() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState('javascript');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      let parsed;
      if (lang === 'json') {
        parsed = JSON.parse(code);
        setOutput(JSON.stringify(parsed, null, indent));
      } else {
        // Basic HTML beautify
        let formatted = code
          .replace(/></g, '>\n<')
          .replace(/(\n\s*)+/g, '\n');
        let result = '';
        let indentLevel = 0;
        formatted.split('\n').forEach(line => {
          line = line.trim();
          if (!line) return;
          if (line.startsWith('</')) indentLevel = Math.max(0, indentLevel - 1);
          result += '  '.repeat(indentLevel) + line + '\n';
          if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) indentLevel++;
        });
        setOutput(result.trim());
      }
    } catch (e) {
      setOutput('格式化失败: ' + e.message);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">语言</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="json">JSON</option>
            <option value="html">HTML</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">缩进</label>
          <select value={indent} onChange={e=>setIndent(Number(e.target.value))} className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value={2}>2空格</option>
            <option value={4}>4空格</option>
            <option value={1}>1 Tab</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入</label>
        <textarea
          value={code}
          onChange={e=>setCode(e.target.value)}
          placeholder={`粘贴${lang==='json'?'JSON':'HTML'}代码...`}
          className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>
      <button
        onClick={format}
        disabled={!code.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        格式化
      </button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">结果</label>
            <button onClick={copyOutput} className={`text-xs px-3 py-1 rounded-lg transition-colors ${copied?'bg-green-100 dark:bg-green-900/30 text-green-600':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {copied?'已复制!':'复制'}
            </button>
          </div>
          <pre className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-64 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
