import { useState } from 'react';

export default function CaseConverter() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = (type) => {
    let converted = '';
    switch (type) {
      case 'upper':
        converted = text.toUpperCase();
        break;
      case 'lower':
        converted = text.toLowerCase();
        break;
      case 'title':
        converted = text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'capitalize':
        converted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        break;
      case 'toggle':
        converted = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        break;
      case 'camel':
        converted = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
        break;
      case 'pascal':
        converted = text.replace(/(^|[\s-])(\w)/g, (_, __, c) => c.toUpperCase()).replace(/[\s-]/g, '');
        break;
      case 'snake':
        converted = text.replace(/\s+/g, '_').toLowerCase();
        break;
      case 'kebab':
        converted = text.replace(/\s+/g, '-').toLowerCase();
        break;
      default:
        converted = text;
    }
    setResult(converted);
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
      {/* 输入区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          输入文本
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入需要转换的文本..."
          className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none"
        />
      </div>

      {/* 转换按钮 */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {[
          { id: 'upper', label: '全部大写', icon: 'AA' },
          { id: 'lower', label: '全部小写', icon: 'aa' },
          { id: 'title', label: '标题大小写', icon: 'Aa' },
          { id: 'capitalize', label: '首字母大写', icon: 'A.' },
          { id: 'toggle', label: '切换大小写', icon: 'aA' },
          { id: 'camel', label: '驼峰命名', icon: 'aB' },
          { id: 'pascal', label: '帕斯卡', icon: 'AB' },
          { id: 'snake', label: '下划线', icon: 'a_b' },
          { id: 'kebab', label: '短横线', icon: 'a-b' },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => convert(id)}
            className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl transition-all"
          >
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{icon}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
          </button>
        ))}
      </div>

      {/* 结果展示 */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              转换结果
            </label>
            <button
              onClick={copyToClipboard}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
          <div className="relative">
            <textarea
              value={result}
              readOnly
              className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
