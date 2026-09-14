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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">祝福类型</label>
        <div className="flex gap-2">
          {Object.keys(BIRTHDAY_PHRASES).map(t => <button key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${type === t ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{t}</button>)}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">收件人姓名</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="可选..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
      </div>
      <button onClick={generate} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">生成祝福语</button>
      {output && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-6 text-center">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{output}</p>
          <button onClick={() => navigator.clipboard.writeText(output)} className="mt-3 text-sm text-blue-500 hover:text-blue-600">复制</button>
        </div>
      )}
    </div>
  );
}
