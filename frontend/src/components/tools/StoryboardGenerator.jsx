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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">故事内容</label>
        <textarea value={story} onChange={e => setStory(e.target.value)} placeholder="输入故事内容，用句号分隔各场景..." className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>
      <button onClick={generate} disabled={!story.trim()} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">生成分镜脚本</button>
      {output.length > 0 && (
        <div className="space-y-3">
          {output.map((s, i) => (
            <div key={i} className="flex gap-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">{s.num}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">{s.shot}</span>
                  <span className="text-xs text-gray-400">{s.duration}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{s.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
