import { useState } from 'react';
export default function HtmlEntity() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const specialChars = [
    { char: '&', entity: '&amp;' },
    { char: '<', entity: '&lt;' },
    { char: '>', entity: '&gt;' },
    { char: '"', entity: '&quot;' },
    { char: "'", entity: '&#39;' },
    { char: '©', entity: '&copy;' },
    { char: '®', entity: '&reg;' },
    { char: '—', entity: '&mdash;' },
    { char: '–', entity: '&ndash;' },
    { char: '…', entity: '&hellip;' },
    { char: '™', entity: '&trade;' },
    { char: '°', entity: '&deg;' },
    { char: '×', entity: '&times;' },
    { char: '÷', entity: '&divide;' },
  ];

  const handleEncode = () => {
    try {
      setError('');
      let result = input;
      specialChars.forEach(({ char, entity }) => {
        result = result.split(char).join(entity);
      });
      result = result.replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
      setOutput(result);
    } catch (e) {
      setError('编码失败');
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      let result = input;
      result = result.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
        .replace(/<br>/g, '\n')
        .replace(/&copy;/g, '©').replace(/&reg;/g, '®')
        .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
        .replace(/&hellip;/g, '…').replace(/&trade;/g, '™')
        .replace(/&deg;/g, '°').replace(/&times;/g, '×')
        .replace(/&divide;/g, '÷');
      setOutput(result);
    } catch (e) {
      setError('解码失败');
    }
  };

  const handleModeChange = (m) => {
    setMode(m);
    setInput('');
    setOutput('');
    setError('');
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
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange('encode')}
          className={`flex-1 py-3 rounded-card font-medium transition-all ${
            mode === 'encode'
              ? 'bg-accent text-accent-fg'
              : 'bg-surface-2 text-ink-2'
          }`}
        >
          编码
        </button>
        <button
          onClick={() => handleModeChange('decode')}
          className={`flex-1 py-3 rounded-card font-medium transition-all ${
            mode === 'decode'
              ? 'bg-accent text-accent-fg'
              : 'bg-surface-2 text-ink-2'
          }`}
        >
          解码
        </button>
      </div>

      <div>
        <label className="lbl">
          {mode === 'encode' ? 'HTML文本' : 'HTML实体字符串'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '输入包含特殊字符的文本...' : '输入HTML实体字符串...'}
          className="w-full h-40 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft resize-none"
        />
      </div>

      <button
        onClick={mode === 'encode' ? handleEncode : handleDecode}
        disabled={!input.trim()}
        className="btn-a w-full transition-colors"
      >
        {mode === 'encode' ? '编码为HTML实体' : '解码HTML实体'}
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

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
            className="w-full h-40 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none font-mono text-sm"
          />
        </div>
      )}

      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">常用实体</div>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono">
          <span>{'<'} → &lt;</span>
          <span>{'>'} → &gt;</span>
          <span>& → &amp;</span>
          <span>" → &quot;</span>
          <span>空格 → &nbsp;</span>
          <span>换行 → &lt;br&gt;</span>
        </div>
      </div>
    </div>
  );
}
