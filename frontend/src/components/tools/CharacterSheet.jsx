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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">角色名称</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="输入名称..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">性别</label>
          <div className="flex gap-2">
            {['男', '女', '其他'].map(g => <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${gender === g ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{g}</button>)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">年龄</label><input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder="25" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">职业</label><input type="text" value={job} onChange={e => setJob(e.target.value)} placeholder="程序员" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">性格特点</label><input type="text" value={personality} onChange={e => setPersonality(e.target.value)} placeholder="开朗、正直、幽默" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" /></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">外貌特征</label><input type="text" value={appearance} onChange={e => setAppearance(e.target.value)} placeholder="高挑、黑发、戴眼镜" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" /></div>
      <button onClick={generate} disabled={!name.trim()} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">生成角色卡</button>
      {output && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl shrink-0">🎭</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{output.name}</h2>
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">{output.gender}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{output.job} · {output.age}岁</div>
              <div className="text-sm text-gray-700 dark:text-gray-300"><strong>性格：</strong>{output.personality}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300"><strong>外貌：</strong>{output.appearance}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {statLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-12">{label}</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${stats[i]}%` }} />
                </div>
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400 w-8 text-right">{stats[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-400">ID: {output.id} | 创建: {output.created}</div>
        </div>
      )}
    </div>
  );
}
