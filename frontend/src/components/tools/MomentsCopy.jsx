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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">心情</label>
        <div className="flex gap-2">
          {['happy', 'sad', 'motivational'].map(m => <button key={m} onClick={() => setMood(m)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mood === m ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{m === 'happy' ? '开心' : m === 'sad' ? '伤感' : '励志'}</button>)}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">场景</label>
        <div className="flex gap-2">
          {['daily', 'work', 'travel'].map(s => <button key={s} onClick={() => setScenario(s)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${scenario === s ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{s === 'daily' ? '日常' : s === 'work' ? '工作' : '旅行'}</button>)}
        </div>
      </div>
      <button onClick={generate} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">生成文案</button>
      {output && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
          <p className="text-gray-800 dark:text-gray-200 text-base">{output}</p>
          <button onClick={() => navigator.clipboard.writeText(output)} className="mt-3 text-sm text-blue-500 hover:text-blue-600">复制文案</button>
        </div>
      )}
    </div>
  );
}
