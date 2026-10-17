import { useState } from 'react';
import SparkMD5 from 'spark-md5';
import Icon from '../Icons';
import { fmtSize, BTN_PRIMARY } from '../../lib/file-utils';

/** ArrayBuffer -> 十六进制字符串 */
function toHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const LIST = [
  { key: 'md5', name: 'MD5', color: 'blue' },
  { key: 'sha1', name: 'SHA-1', color: 'green' },
  { key: 'sha256', name: 'SHA-256', color: 'purple' },
  { key: 'sha512', name: 'SHA-512', color: 'orange' },
];

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [copied, setCopied] = useState('');
  const [fileInfo, setFileInfo] = useState(null);

  const generateHashes = async (text) => {
    if (!text) {
      setResults({});
      return;
    }
    const data = new TextEncoder().encode(text);
    const [sha1, sha256, sha512] = await Promise.all([
      crypto.subtle.digest('SHA-1', data),
      crypto.subtle.digest('SHA-256', data),
      crypto.subtle.digest('SHA-512', data),
    ]);
    setResults({
      md5: SparkMD5.hash(text), // 真正的 MD5（128 位 / 32 位十六进制）
      sha1: toHex(sha1),
      sha256: toHex(sha256),
      sha512: toHex(sha512),
    });
  };

  /** 文件模式：分块读取算 MD5 / SHA-256，避免一次性载入大文件 */
  const hashFile = async (file) => {
    const spark = new SparkMD5.ArrayBuffer();
    const CHUNK = 4 * 1024 * 1024;
    const total = file.size;
    let offset = 0;
    while (offset < total) {
      const slice = file.slice(offset, Math.min(offset + CHUNK, total));
      spark.append(await slice.arrayBuffer());
      offset += CHUNK;
      setFileInfo({ name: file.name, size: total, percent: Math.min(99, Math.round((offset / total) * 100)) });
    }
    const md5 = spark.end();
    const whole = new Uint8Array(await file.arrayBuffer());
    const sha256 = toHex(await crypto.subtle.digest('SHA-256', whole));
    setFileInfo({ name: file.name, size: total, percent: 100 });
    setResults({ md5, sha1: '', sha256, sha512: '' });
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

  const visible = LIST.filter((x) => results[x.key]);

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div>
        <label className="lbl">
          输入文本
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            generateHashes(e.target.value);
          }}
          placeholder="请输入要计算哈希值的文本..."
          className="w-full h-32 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft focus:border-accent resize-none"
        />
      </div>

      {/* 文件模式 */}
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-6 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('hf')?.click()}
      >
        <input
          id="hf"
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) hashFile(f);
          }}
        />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="file" /></span></div>
        <p className="text-sm text-ink-2">
          {fileInfo ? `已计算：${fileInfo.name}` : '或点击选择文件，计算文件校验值'}
        </p>
        {fileInfo && (
          <p className="text-xs text-ink-3 mt-1">
            {fmtSize(fileInfo.size)} · {fileInfo.percent}%
          </p>
        )}
      </div>

      {/* 哈希结果 */}
      {visible.length > 0 && (
        <div className="space-y-3">
          {/* color 字段原来拼成 text-${color}-600 —— 动态串 Tailwind JIT 扫不到，线上一直是无色；
              而且四个哈希各分一种颜色本来就是彩虹。统一中性字重，靠 name 区分。 */}
          {visible.map(({ key, name }) => (
            <div key={key} className="flex items-center gap-3 bg-paper rounded-card p-3">
              <div className="w-16 text-center text-sm font-semibold text-ink">
                {name}
              </div>
              <code className="flex-1 text-sm text-ink-2 font-mono break-all">
                {results[key]}
              </code>
              <button
                onClick={() => copyToClipboard(key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  copied === key
                    ? 'bg-success-soft text-success'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                }`}
              >
                {copied === key ? '已复制' : '复制'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 说明 */}
      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="flex items-center gap-2 font-medium text-ink mb-2 text-sm"><Icon name="bulb" /><span>哈希值用途</span></div>
        <ul className="space-y-1 text-xs">
          <li>• <strong>MD5</strong>: 快速校验文件完整性（128位）</li>
          <li>• <strong>SHA-1</strong>: 版本控制、Git使用（160位）</li>
          <li>• <strong>SHA-256</strong>: 区块链、密码存储（256位，最常用）</li>
          <li>• <strong>SHA-512</strong>: 高安全性需求场景（512位）</li>
        </ul>
        <p className="text-xs mt-2 text-ink-3">
          文本模式实时计算；文件模式在本地分块读取，文件不会上传到服务器。
        </p>
      </div>
    </div>
  );
}
