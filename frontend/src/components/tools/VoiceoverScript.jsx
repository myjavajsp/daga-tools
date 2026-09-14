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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">配音主题</label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map(t => <button key={t} onClick={() => setTopic(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${topic === t ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{t}</button>)}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">预计时长</span>
          <span className="font-mono text-gray-900 dark:text-white">{duration}秒</span>
        </div>
        <input type="range" min="10" max="120" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
      </div>
      <button onClick={generate} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">生成配音脚本</button>
      {output && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">配音文案</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-blue-500">复制</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{output}</pre>
        </div>
      )}
    </div>
  );
}
