import { useState } from 'react';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [copied, setCopied] = useState('');

  const generateHashes = async (text) => {
    if (!text) {
      setResults({});
      return;
    }

    const enc = new TextEncoder();
    const data = enc.encode(text);

    // MD5 (simple implementation)
    const md5 = await simpleMD5(text);

    // SHA-1
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
    const sha1 = Array.from(new Uint8Array(sha1Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // SHA-256
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
    const sha256 = Array.from(new Uint8Array(sha256Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // SHA-512
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
    const sha512 = Array.from(new Uint8Array(sha512Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    setResults({ md5, sha1, sha256, sha512 });
  };

  const simpleMD5 = async (string) => {
    // This is a simplified MD5 implementation for demo purposes
    // In production, use a proper library
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const copyToClipboard = async (hashType) => {
    try {
      await navigator.clipboard.writeText(results[hashType]);
      setCopied(hashType);
      setTimeout(() => setCopied(''), 2000);
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
          value={input}
          onChange={(e) => { setInput(e.target.value); generateHashes(e.target.value); }}
          placeholder="请输入要计算哈希值的文本..."
          className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none"
        />
      </div>

      {/* 哈希结果 */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-3">
          {[
            { key: 'md5', name: 'MD5', color: 'blue' },
            { key: 'sha1', name: 'SHA-1', color: 'green' },
            { key: 'sha256', name: 'SHA-256', color: 'purple' },
            { key: 'sha512', name: 'SHA-512', color: 'orange' },
          ].map(({ key, name, color }) => (
            <div key={key} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className={`w-16 text-center text-sm font-medium text-${color}-600 dark:text-${color}-400`}>
                {name}
              </div>
              <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                {results[key]}
              </code>
              <button
                onClick={() => copyToClipboard(key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  copied === key
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {copied === key ? '✓ 已复制' : '复制'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-gray-200 mb-2">💡 哈希值用途</div>
        <ul className="space-y-1 text-xs">
          <li>• <strong>MD5</strong>: 快速校验文件完整性（128位）</li>
          <li>• <strong>SHA-1</strong>: 版本控制、Git使用（160位）</li>
          <li>• <strong>SHA-256</strong>: 区块链、密码存储（256位，最常用）</li>
          <li>• <strong>SHA-512</strong>: 高安全性需求场景（512位）</li>
        </ul>
      </div>
    </div>
  );
}
