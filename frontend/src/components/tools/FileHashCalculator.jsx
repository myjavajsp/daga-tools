import { useState } from 'react';
export default function FileHashCalculator() {
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const calcHash = async (buf, algo) => {
    const hashBuffer = await crypto.subtle.digest(algo, buf);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setHashes({});
    try {
      const buf = await f.arrayBuffer();
      const [md5, sha1, sha256, sha512] = await Promise.all([
        calcHash(buf, 'MD5'),
        calcHash(buf, 'SHA-1'),
        calcHash(buf, 'SHA-256'),
        calcHash(buf, 'SHA-512'),
      ]);
      setHashes({ md5, sha1, sha256, sha512 });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const copyHash = async (key, val) => {
    await navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input id="fileInput" type="file" onChange={handleFile} className="hidden" accept="*/*" />
        <div className="text-4xl mb-3">📁</div>
        <p className="text-gray-600 dark:text-gray-400 mb-1">{file ? file.name : '点击或拖拽上传文件'}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">支持任意文件类型</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
        </div>
      )}

      {file && !loading && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 dark:text-gray-400">文件名</span>
            <span className="text-gray-900 dark:text-white font-medium">{file.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">大小</span>
            <span className="text-gray-900 dark:text-white font-medium">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      )}

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-2">
          {[
            { key: 'md5', label: 'MD5', color: 'blue' },
            { key: 'sha1', label: 'SHA-1', color: 'green' },
            { key: 'sha256', label: 'SHA-256', color: 'purple' },
            { key: 'sha512', label: 'SHA-512', color: 'orange' },
          ].map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <span className={`w-16 text-center text-sm font-medium text-${color}-600 dark:text-${color}-400`}>{label}</span>
              <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{hashes[key]}</code>
              <button
                onClick={() => copyHash(key, hashes[key])}
                className={`px-2 py-1 rounded text-xs ${copied === key ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}
              >
                {copied === key ? '已复制' : '复制'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
