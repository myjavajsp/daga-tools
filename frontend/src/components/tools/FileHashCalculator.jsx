import { useState } from 'react';
import Icon from '../Icons';
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
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input id="fileInput" type="file" onChange={handleFile} className="hidden" accept="*/*" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="file" /></span></div>
        <p className="text-ink-2 mb-1">{file ? file.name : '点击或拖拽上传文件'}</p>
        <p className="text-xs text-ink-3">支持任意文件类型</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin spin"></div>
        </div>
      )}

      {file && !loading && (
        <div className="bg-paper rounded-card p-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-ink-3">文件名</span>
            <span className="text-ink font-medium">{file.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-3">大小</span>
            <span className="text-ink font-medium">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      )}

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-2">
          {/* 四种哈希不再各给一个颜色：动态拼出来的 text-${color}-600 Tailwind JIT 根本扫不到，
              线上一直是没颜色的；四个紫绿橙蓝轮转本身也是「彩虹仪表盘」。统一中性字重，靠 label 区分。 */}
          {[
            { key: 'md5', label: 'MD5' },
            { key: 'sha1', label: 'SHA-1' },
            { key: 'sha256', label: 'SHA-256' },
            { key: 'sha512', label: 'SHA-512' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3 bg-paper rounded-card p-3">
              <span className="w-16 text-center text-sm font-semibold text-ink">{label}</span>
              <code className="flex-1 text-xs font-mono text-ink-2 break-all">{hashes[key]}</code>
              <button
                onClick={() => copyHash(key, hashes[key])}
                className={`px-2 py-1 rounded text-xs ${copied === key ? 'bg-success-soft text-success' : 'bg-surface-2 text-ink-2 hover:bg-surface-3'}`}
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
