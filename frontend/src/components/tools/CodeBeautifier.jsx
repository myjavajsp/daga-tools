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
          <label className="lbl">语言</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="input w-full">
            <option value="json">JSON</option>
            <option value="html">HTML</option>
          </select>
        </div>
        <div>
          <label className="lbl">缩进</label>
          <select value={indent} onChange={e=>setIndent(Number(e.target.value))} className="input">
            <option value={2}>2空格</option>
            <option value={4}>4空格</option>
            <option value={1}>1 Tab</option>
          </select>
        </div>
      </div>
      <div>
        <label className="lbl">输入</label>
        <textarea
          value={code}
          onChange={e=>setCode(e.target.value)}
          placeholder={`粘贴${lang==='json'?'JSON':'HTML'}代码...`}
          className="w-full h-48 px-4 py-3 bg-paper border border-line rounded-card text-ink font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>
      <button
        onClick={format}
        disabled={!code.trim()}
        className="btn-a w-full transition-colors"
      >
        格式化
      </button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lbl">结果</label>
            <button onClick={copyOutput} className={`text-xs px-3 py-1 rounded-lg transition-colors ${copied?'bg-success-soft text-success':'bg-surface-2 text-ink-2'}`}>
              {copied?'已复制!':'复制'}
            </button>
          </div>
          <pre className="p-4 bg-paper rounded-card text-sm font-mono text-ink overflow-auto max-h-64 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
