import { useState } from 'react';
export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    try {
      setError('');
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch (e) {
      setError('编码失败: ' + e.message);
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch (e) {
      setError('解码失败: 输入可能不是有效的Base64字符串');
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
          {mode === 'encode' ? '原文' : 'Base64字符串'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入Base64字符串...'}
          className="w-full h-40 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft resize-none"
        />
      </div>

      <button
        onClick={mode === 'encode' ? handleEncode : handleDecode}
        disabled={!input.trim()}
        className="btn-a w-full transition-colors"
      >
        {mode === 'encode' ? '编码' : '解码'}
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
          <div className="relative">
            <textarea
              value={output}
              readOnly
              className="w-full h-40 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none font-mono text-sm"
            />
          </div>
        </div>
      )}

      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">使用说明</div>
        <ul className="space-y-1 text-xs">
          <li>• 编码：将文本转换为Base64格式（支持中文）</li>
          <li>• 解码：将Base64字符串还原为原始文本</li>
          <li>• Base64常用于数据传输和存储</li>
        </ul>
      </div>
    </div>
  );
}
