import { useState } from 'react';
export default function MomentsCopy() {
  const [mood, setMood] = useState('happy');
  const [scenario, setScenario] = useState('daily');
  const [output, setOutput] = useState('');

  const copyTemplates = {
    happy: { daily: ['今天的心情，像阳光一样灿烂☀️', '简单的快乐，也是快乐💛', '生活明朗，万物可爱🌸'], work: ['加班的夜晚，也有星光相伴✨', '努力工作的样子，真好看💪'], travel: ['走过的路，都是风景🌍', '每一张照片，都是回忆的宝藏📸'] },
    sad: { daily: ['有些情绪，只能自己消化🌧️', '今晚的月亮，有点孤单🌙'], work: ['成年人的世界，没有容易二字😔', '疲惫的时候，允许自己停下来🍃'] },
    motivational: { daily: ['每一份努力，都不会被辜负💪', '今天的你，比昨天更优秀🌟'], work: ['梦想不会逃跑，逃跑的永远是不敢追梦的人🚀', '熬得住就出众，熬不住就出局💎'] },
  };

  const generate = () => {
    const list = copyTemplates[mood]?.[scenario] || copyTemplates.happy.daily;
    setOutput(list[Math.floor(Math.random() * list.length)]);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">心情</label>
        <div className="flex gap-2">
          {['happy', 'sad', 'motivational'].map(m => <button key={m} onClick={() => setMood(m)} className={`flex-1 py-2 rounded-card text-sm font-medium transition-all ${mood === m ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}>{m === 'happy' ? '开心' : m === 'sad' ? '伤感' : '励志'}</button>)}
        </div>
      </div>
      <div>
        <label className="lbl">场景</label>
        <div className="flex gap-2">
          {['daily', 'work', 'travel'].map(s => <button key={s} onClick={() => setScenario(s)} className={`flex-1 py-2 rounded-card text-sm font-medium transition-all ${scenario === s ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}>{s === 'daily' ? '日常' : s === 'work' ? '工作' : '旅行'}</button>)}
        </div>
      </div>
      <button onClick={generate} className="btn-a w-full transition-colors">生成文案</button>
      {output && (
        <div className="bg-paper rounded-card p-4 text-center">
          <p className="text-ink text-base">{output}</p>
          <button onClick={() => navigator.clipboard.writeText(output)} className="act mt-3">复制文案</button>
        </div>
      )}
    </div>
  );
}
