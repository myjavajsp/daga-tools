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
        <label className="lbl">关键词</label>
        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="输入品牌或产品关键词..." className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" />
      </div>
      <button onClick={generate} disabled={!keyword.trim()} className="btn-a w-full">生成标语</button>
      {output.length > 0 && (
        <div className="space-y-2">
          {output.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-paper rounded-card px-4 py-3">
              <span className="text-sm text-ink">{s}</span>
              <button onClick={() => navigator.clipboard.writeText(s)} className="text-xs text-accent">复制</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
