import { useState } from 'react';
import Icon from '../Icons';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-4">
      {/* 控制面板 */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={formatJson}
          className="btn-a px-4 transition-colors text-sm"
        >
          格式化
        </button>
        <button
          onClick={minifyJson}
          className="px-4 py-2 bg-surface-2 text-ink rounded-lg hover:bg-surface-3 transition-colors text-sm font-medium"
        >
          压缩
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-surface-2 text-ink-2 rounded-lg hover:bg-surface-3 transition-colors text-sm font-medium"
        >
          清空
        </button>
        
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-ink-2">缩进:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="input"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={1}>1 Tab</option>
          </select>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="lbl">
            输入 JSON
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="w-full h-64 px-4 py-3 bg-paper border border-line rounded-card text-ink font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lbl">
              输出结果
            </label>
            {output && (
              <button
                onClick={copyToClipboard}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  copied
                    ? 'bg-success-soft text-success'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                }`}
              >
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的 JSON 将显示在这里..."
            className="w-full h-64 px-4 py-3 bg-paper border border-line rounded-card text-ink font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          <div className="flex items-center gap-2">
            <Icon name="alert" className="sz15" />
            <span className="font-medium">JSON 格式错误</span>
          </div>
          <p className="mt-1 text-xs opacity-75">{error}</p>
        </div>
      )}

      {/* 说明 */}
      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="flex items-center gap-2 font-medium text-ink mb-2 text-sm"><Icon name="bulb" /><span>功能说明</span></div>
        <ul className="space-y-1 text-xs">
          <li>• <strong>格式化</strong>: 将紧凑的 JSON 展开为易读的格式</li>
          <li>• <strong>压缩</strong>: 去除所有空白字符，减小 JSON 体积</li>
          <li>• <strong>验证</strong>: 自动检测 JSON 语法是否正确</li>
          <li>• <strong>复制</strong>: 一键复制结果到剪贴板</li>
        </ul>
      </div>
    </div>
  );
}
