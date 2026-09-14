import { useState } from 'react';
export default function ShortDramaScript() {
  const [genre, setGenre] = useState('甜宠');
  const [topic, setTopic] = useState('');
  const [output, setOutput] = useState('');

  const genres = ['甜宠', '复仇', '悬疑', '古装', '现代'];

  const generate = () => {
    if (!topic) return;
    const scripts = {
      '甜宠': `【短剧脚本：${topic}】\n\n第一集：相遇\n场景：咖啡厅\n人物：男主、女主\n\n（女主营办活动中，不小心撞到男主）\n女主：\"对不起对不起！\"\n男主：（递上手帕）\"没事。\"\n（两人对视，心跳加速）\n\n字幕：命运，从此交织...\n\n第二集：靠近\n场景：公司\n...\n\n🎬 类型：甜宠恋爱\n⏱️ 集数：每集1-2分钟\n#甜宠 #短剧`,
      '复仇': `【短剧脚本：${topic}】\n\n第一集：归来\n场景：豪华晚宴\n人物：女主（黑化版）\n\n（女主盛装出场，眼神冰冷）\n女主：\"当年你们欠我的，我会一一讨回。\"\n\n字幕：复仇女神，已就位...\n\n第二集：布局\n场景：办公室\n...\n\n🎬 类型：复仇爽剧\n⏱️ 集数：每集1-2分钟`,
    };
    setOutput(scripts[genre] || scripts['甜宠']);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">短剧类型</label>
        <div className="flex gap-2 flex-wrap">
          {genres.map(g => <button key={g} onClick={() => setGenre(g)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${genre === g ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{g}</button>)}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">故事主题</label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="输入故事主题..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
      </div>
      <button onClick={generate} disabled={!topic.trim()} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">生成脚本</button>
      {output && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">短剧脚本</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-blue-500">复制</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{output}</pre>
        </div>
      )}
    </div>
  );
}
