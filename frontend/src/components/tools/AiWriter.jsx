import { useState } from 'react';
export default function AiWriter() {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('article');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type }),
      });
      const data = await res.json();
      setOutput(data.content || '请连接AI服务后使用');
    } catch {
      // Demo mode
      const demos = {
        article: `关于"${topic}"的深度分析\n\n在当今社会，${topic}已经成为一个备受关注的话题。本文将从多个角度探讨这一主题...\n\n一、背景介绍\n${topic}起源于早期的研究，近年来受到广泛关注。\n\n二、核心观点\n1. ${topic}具有重要的现实意义\n2. 需要从多角度进行分析\n3. 未来发展充满机遇与挑战\n\n三、结论\n综上所述，${topic}值得深入研究，建议持续关注。`,
        email: `主题：关于${topic}的沟通\n\n尊敬的领导：\n\n您好！关于${topic}一事，特此向您汇报...\n\n此致\n敬礼`,
        story: `《${topic}》\n\n在一个遥远的地方，存在着一个关于${topic}的传说...\n\n第一章：开端\n故事从这里开始...',
      };
      setOutput(demos[type] || demos.article);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">写作主题</label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="输入写作主题..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文章类型</label>
        <div className="flex gap-2">
          {[{ id: 'article', label: '文章' }, { id: 'email', label: '邮件' }, { id: 'story', label: '故事' }].map(({ id, label }) => (
            <button key={id} onClick={() => setType(id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${type === id ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{label}</button>
          ))}
        </div>
      </div>
      <button onClick={generate} disabled={!topic.trim() || loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">
        {loading ? '生成中...' : '开始写作'}
      </button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">生成结果</label>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
          </div>
          <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200">{output}</pre>
        </div>
      )}
    </div>
  );
}
