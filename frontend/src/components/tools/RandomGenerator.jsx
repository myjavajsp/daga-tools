import { useState } from 'react';

export default function RandomGenerator() {
  const [type, setType] = useState('password');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let chars = '';
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) chars += '0123456789';
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!chars) {
      chars = 'abcdefghijklmnopqrstuvwxyz';
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    if (type === 'uuid') {
      generated = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else if (type === 'number') {
      generated = Math.floor(Math.random() * Math.pow(10, length)).toString();
    } else if (type === 'datetime') {
      const date = new Date();
      date.setSeconds(date.getSeconds() + Math.floor(Math.random() * 1000000));
      generated = date.toISOString();
    }
    
    setResult(generated);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 类型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          生成类型
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'password', label: '随机密码' },
            { id: 'uuid', label: 'UUID' },
            { id: 'number', label: '随机数字' },
            { id: 'datetime', label: '时间戳' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setType(id)}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                type === id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 长度设置 */}
      {type === 'password' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            长度: {length}
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4</span>
            <span>64</span>
          </div>
        </div>
      )}

      {/* 字符选项 */}
      {type === 'password' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            字符选项
          </label>
          <div className="space-y-2">
            {[
              { id: 'uppercase', label: '大写字母 A-Z' },
              { id: 'lowercase', label: '小写字母 a-z' },
              { id: 'numbers', label: '数字 0-9' },
              { id: 'symbols', label: '特殊符号 !@#$%' },
            ].map(({ id, label }) => (
              <label key={id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[id]}
                  onChange={(e) => setOptions({ ...options, [id]: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 生成按钮 */}
      <button
        onClick={generate}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        生成{type === 'password' ? '随机密码' : type === 'uuid' ? 'UUID' : type === 'number' ? '随机数字' : '时间戳'}
      </button>

      {/* 结果展示 */}
      {result && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <code className="text-lg font-mono text-gray-900 dark:text-white break-all">
              {result}
            </code>
            <button
              onClick={copyToClipboard}
              className={`ml-4 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
