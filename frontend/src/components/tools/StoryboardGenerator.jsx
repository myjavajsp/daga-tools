import { useState } from 'react';
export default function StoryboardGenerator() {
  const [story, setStory] = useState('');
  const [output, setOutput] = useState([]);

  const generate = () => {
    if (!story.trim()) return;
    const scenes = story.split(/[。！？\n]/).filter(s => s.trim()).slice(0, 8);
    const sceneTypes = ['远景', '中景', '特写', '近景', '俯拍', '仰拍'];
    setOutput(scenes.map((s, i) => ({ num: i + 1, content: s, shot: sceneTypes[i % sceneTypes.length], duration: `${Math.floor(Math.random() * 5) + 3}秒` })));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">故事内容</label>
        <textarea value={story} onChange={e => setStory(e.target.value)} placeholder="输入故事内容，用句号分隔各场景..." className="w-full h-40 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none focus:outline-none focus:ring-2 focus:ring-accent-soft" />
      </div>
      <button onClick={generate} disabled={!story.trim()} className="btn-a w-full">生成分镜脚本</button>
      {output.length > 0 && (
        <div className="space-y-3">
          {output.map((s, i) => (
            <div key={i} className="flex gap-4 bg-paper rounded-card p-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-fg font-bold shrink-0">{s.num}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-accent-soft text-accent rounded-full">{s.shot}</span>
                  <span className="text-xs text-ink-3">{s.duration}</span>
                </div>
                <p className="text-sm text-ink">{s.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
