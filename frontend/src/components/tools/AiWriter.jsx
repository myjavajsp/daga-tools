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
        <label className="lbl">写作主题</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generate()}
          placeholder="输入写作主题，如：如何用三个月入门摄影"
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <div>
        <label className="lbl">文章类型</label>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${
                type === t.id
                  ? 'bg-accent text-accent-fg'
                  : 'bg-surface-2 text-ink-2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="lbl">语气风格</label>
        <div className="flex gap-2 flex-wrap">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                tone === t.id
                  ? 'bg-accent text-accent-fg'
                  : 'bg-surface-2 text-ink-2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="lbl">篇幅</label>
        <div className="flex gap-2 flex-wrap">
          {LENGTHS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLength(l.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                length === l.id
                  ? 'bg-accent text-accent-fg'
                  : 'bg-surface-2 text-ink-2'
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
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lbl">生成结果</label>
            <button
              onClick={copyText}
              className="px-2 py-1 text-xs rounded bg-accent text-accent-fg hover:bg-accent-press"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap bg-paper rounded-card p-4 text-sm text-ink">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
