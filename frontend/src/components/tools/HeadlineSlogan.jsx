import { useState } from 'react';
export default function HeadlineSlogan() {
  const [keyword, setKeyword] = useState('');
  const [output, setOutput] = useState([]);

  const slogans = {
    '产品': ['品质之选，信赖之选', '匠心打造，品质保证', '只为更好的你'],
    '活动': ['限时特惠，错过再无', '狂欢来袭，超值抢购', '全场低至5折'],
    '节日': ['节日快乐，感恩有你', '佳节相聚，共享美好', '温暖相伴，幸福同行'],
    '品牌': ['品牌的力量，品质的承诺', '创新引领，品质至上', '因为专业，所以信赖'],
  };

  const generate = () => {
    if (!keyword) return;
    const all = [...slogans['产品'], ...slogans['活动'], ...slogans['节日']];
    const results = [];
    for (let i = 0; i < 6; i++) {
      results.push(`${keyword} | ${all[Math.floor(Math.random() * all.length)]}`);
    }
    setOutput(results);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">关键词</label>
        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="输入品牌或产品关键词..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
      </div>
      <button onClick={generate} disabled={!keyword.trim()} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">生成标语</button>
      {output.length > 0 && (
        <div className="space-y-2">
          {output.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-800 dark:text-gray-200">{s}</span>
              <button onClick={() => navigator.clipboard.writeText(s)} className="text-xs text-blue-500">复制</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
