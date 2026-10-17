import { useState } from 'react';
export default function DouyinScript() {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('搞笑');
  const [output, setOutput] = useState('');

  const genres = ['搞笑', '情感', '知识', '剧情', ' Vlog'];

  const generate = () => {
    if (!topic) return;
    const scripts = {
      '搞笑': `【抖音脚本：${topic}】\n\n🎬 场景：日常生活\n👤 人物：1-2人\n⏱️ 时长：15-30秒\n\n【开头】（0-3秒）\n主播做出夸张表情：\"家人们谁懂啊...\"\n\n【中间】（3-25秒）\n讲述${topic}的经历，配合夸张动作\n\n【结尾】（25-30秒）\n\"你们遇到过这种情况吗？评论区告诉我！\"\n\n🎵 BGM：欢快节奏\n#${topic.replace(/\s/g, '')} #搞笑`,
      '情感': `【抖音脚本：${topic}】\n\n🎬 场景：温馨室内\n👤 人物：主角单人\n⏱️ 时长：20-40秒\n\n【开头】（0-5秒）\n温柔旁白：\"你有没有想过...\"\n\n【中间】（5-35秒）\n结合${topic}讲述情感故事\n\n【结尾】（35-40秒）\n\"关注我，每天给你温暖💕\"\n\n🎵 BGM：抒情钢琴曲\n#${topic.replace(/\s/g, '')} #情感`,
    };
    setOutput(scripts[genre] || scripts['搞笑']);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">视频主题</label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="输入视频主题..." className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" />
      </div>
      <div>
        <label className="lbl">视频类型</label>
        <div className="flex gap-2 flex-wrap">
          {genres.map(g => <button key={g} onClick={() => setGenre(g)} className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${genre === g ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}>{g}</button>)}
        </div>
      </div>
      <button onClick={generate} disabled={!topic.trim()} className="btn-a w-full">生成脚本</button>
      {output && (
        <div className="bg-paper rounded-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-2">抖音脚本</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-accent">复制</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-ink">{output}</pre>
        </div>
      )}
    </div>
  );
}
