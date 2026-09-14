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
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === 'encode'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          编码
        </button>
        <button
          onClick={() => handleModeChange('decode')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === 'decode'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          解码
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === 'encode' ? 'HTML文本' : 'HTML实体字符串'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '输入包含特殊字符的文本...' : '输入HTML实体字符串...'}
          className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
        />
      </div>

      <button
        onClick={mode === 'encode' ? handleEncode : handleDecode}
        disabled={!input.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        {mode === 'encode' ? '编码为HTML实体' : '解码HTML实体'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

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
            className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none font-mono text-sm"
          />
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-gray-200 mb-2">常用实体</div>
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
