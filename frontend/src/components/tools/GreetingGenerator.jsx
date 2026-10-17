import { useState } from 'react';
const BIRTHDAY_PHRASES = {
  '生日': ['生日快乐！愿你年年有今日，岁岁有今朝！🎂', '祝你生日快乐，永远年轻美丽！🎉', '生日快乐！愿你的每一天都充满阳光！☀️'],
  '新年': ['新年快乐！祝你万事如意，心想事成！🎊', '新年快乐，阖家幸福，身体健康！🧧', '新春快乐！愿新的一年带来好运！🐉'],
  '节日': ['节日快乐！祝你 happiness 满满！🎁', '祝节日快乐，好运常伴！✨', '节日快乐，祝你笑口常开！😄'],
};
export default function GreetingGenerator() {
  const [type, setType] = useState('生日');
  const [name, setName] = useState('');
  const [output, setOutput] = useState('');

  const generate = () => {
    const list = BIRTHDAY_PHRASES[type] || BIRTHDAY_PHRASES['生日'];
    const msg = list[Math.floor(Math.random() * list.length)];
    setOutput(name ? `${msg}\n\n——致${name}` : msg);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">祝福类型</label>
        <div className="flex gap-2">
          {Object.keys(BIRTHDAY_PHRASES).map(t => <button key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${type === t ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}>{t}</button>)}
        </div>
      </div>
      <div>
        <label className="lbl">收件人姓名</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="可选..." className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" />
      </div>
      <button onClick={generate} className="btn-a w-full transition-colors">生成祝福语</button>
      {output && (
        <div className="bg-surface-2 border border-line rounded-card p-6 text-center">
          <p className="text-ink whitespace-pre-wrap">{output}</p>
          <button onClick={() => navigator.clipboard.writeText(output)} className="act mt-3">复制</button>
        </div>
      )}
    </div>
  );
}
