import { useState } from 'react';
export default function CharacterSheet() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('男');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [personality, setPersonality] = useState('');
  const [appearance, setAppearance] = useState('');
  const [output, setOutput] = useState(null);

  const generate = () => {
    if (!name) return;
    setOutput({
      name, gender, age: age || '25', job: job || '未知',
      personality: personality || '温和',
      appearance: appearance || '中等身材',
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      created: new Date().toLocaleDateString('zh-CN'),
    });
  };

  const statLabels = ['力量', '敏捷', '智力', '魅力', '运气'];
  const stats = statLabels.map(() => Math.floor(Math.random() * 40) + 60);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="lbl">角色名称</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="输入名称..." className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" />
        </div>
        <div>
          <label className="lbl">性别</label>
          <div className="flex gap-2">
            {['男', '女', '其他'].map(g => <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2 rounded-card text-sm font-medium ${gender === g ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}>{g}</button>)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="lbl">年龄</label><input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder="25" className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" /></div>
        <div><label className="lbl">职业</label><input type="text" value={job} onChange={e => setJob(e.target.value)} placeholder="程序员" className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" /></div>
      </div>
      <div><label className="lbl">性格特点</label><input type="text" value={personality} onChange={e => setPersonality(e.target.value)} placeholder="开朗、正直、幽默" className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" /></div>
      <div><label className="lbl">外貌特征</label><input type="text" value={appearance} onChange={e => setAppearance(e.target.value)} placeholder="高挑、黑发、戴眼镜" className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" /></div>
      <button onClick={generate} disabled={!name.trim()} className="btn-a w-full">生成角色卡</button>
      {output && (
        <div className="bg-surface-2 border border-line rounded-card p-6">
          <div className="flex items-start gap-4">
            <span className="chip shrink-0"><Icon name="maskface" /></span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-ink">{output.name}</h2>
                <span className="text-xs px-2 py-0.5 bg-accent-soft text-accent rounded-full">{output.gender}</span>
              </div>
              <div className="text-sm text-ink-3 mb-3">{output.job} · {output.age}岁</div>
              <div className="text-sm text-ink-2"><strong>性格：</strong>{output.personality}</div>
              <div className="text-sm text-ink-2"><strong>外貌：</strong>{output.appearance}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {statLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-ink-3 w-12">{label}</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${stats[i]}%` }} />
                </div>
                <span className="text-xs font-mono text-ink-2 w-8 text-right">{stats[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-ink-3">ID: {output.id} | 创建: {output.created}</div>
        </div>
      )}
    </div>
  );
}
