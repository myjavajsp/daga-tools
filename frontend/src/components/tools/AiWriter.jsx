import { useState } from 'react';
import { BTN_PRIMARY } from '../../lib/file-utils';

const TYPES = [
  { id: 'article', label: '文章' },
  { id: 'email', label: '邮件' },
  { id: 'story', label: '故事' },
  { id: 'xiaohongshu', label: '小红书' },
  { id: 'douyin', label: '抖音脚本' },
];

const TONES = [
  { id: 'professional', label: '专业' },
  { id: 'casual', label: '轻松' },
  { id: 'humor', label: '幽默' },
  { id: 'emotional', label: '走心' },
];

const LENGTHS = [
  { id: 'short', label: '短 (100字)' },
  { id: 'medium', label: '中 (300字)' },
  { id: 'long', label: '长 (800字+)' },
];

export default function AiWriter() {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('article');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) {
      setError('请输入写作主题');
      return;
    }
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const res = await fetch('/api/ai/writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type, tone, length }),
      });
      const data = await res.json().catch(() => null);
      if (!data || !data.success) {
        throw new Error((data && (data.message || data.error)) || '生成失败');
      }
      setOutput(String(data.text || '').trim() || '（模型未返回内容，请调整主题重试）');
    } catch (err) {
      setError(err?.message || '生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">写作主题</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generate()}
          placeholder="输入写作主题，如：如何用三个月入门摄影"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文章类型</label>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                type === t.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">语气风格</label>
        <div className="flex gap-2 flex-wrap">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                tone === t.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">篇幅</label>
        <div className="flex gap-2 flex-wrap">
          {LENGTHS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLength(l.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                length === l.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={!topic.trim() || loading} className={BTN_PRIMARY}>
        {loading ? '生成中…' : '开始写作'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">生成结果</label>
            <button
              onClick={copyText}
              className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
