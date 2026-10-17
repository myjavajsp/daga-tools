import { useState } from 'react';
const TOPICS = ['创业', '职场', '情感', '健康', '学习', '理财'];
export default function VoiceoverScript() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [duration, setDuration] = useState(30);
  const [output, setOutput] = useState('');

  const templates = {
    '创业': ['创业路上，每一步都是成长。', '选择创业，就是选择了一条不平凡的路。', '成功的创业者，从不畏惧失败。'],
    '职场': ['职场如战场，智者胜。', '职场中，能力是基础，态度是关键。', '优秀的职场人，懂得平衡与成长。'],
    '情感': ['感情里没有对错，只有理解。', '最好的感情，是彼此成就。', '爱，是世界上最美好的事情。'],
  };

  const generate = () => {
    const t = templates[topic] || templates['创业'];
    let script = '';
    const sentences = Math.ceil(duration / 5);
    for (let i = 0; i < sentences; i++) {
      script += t[i % t.length] + '\n';
    }
    setOutput(script.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">配音主题</label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map(t => <button key={t} onClick={() => setTopic(t)} className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${topic === t ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}>{t}</button>)}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-2">预计时长</span>
          <span className="font-mono text-ink">{duration}秒</span>
        </div>
        <input type="range" min="10" max="120" value={duration} onChange={e => setDuration(Number(e.target.value))} className="slider" />
      </div>
      <button onClick={generate} className="btn-a w-full transition-colors">生成配音脚本</button>
      {output && (
        <div className="bg-paper rounded-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-2">配音文案</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-accent">复制</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-ink">{output}</pre>
        </div>
      )}
    </div>
  );
}
