import { useState } from 'react';
export default function XiaohongshuCopy() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('种草');
  const [output, setOutput] = useState('');

  const styles = ['种草', '测评', '日常', '教程', '攻略'];

  const generate = () => {
    if (!topic) return;
    const templates = {
      '种草': `✨必入！${topic}太好用了吧😭\n\n姐妹们！我发现了一个宝藏好物——${topic}\n\n✅ 使用感受：真的绝绝子！\n✅ 性价比：超高，学生党也能冲\n✅ 推荐指数：⭐⭐⭐⭐⭐\n\n#${topic.replace(/\s/g, '')} #好物分享 #种草`,
      '测评': `📝${topic}真实测评！不吹不黑\n\n用了两周，来交作业了👇\n\n【优点】\n1. 效果确实不错\n2. 使用感很舒服\n3. 性价比可以\n\n【缺点】\n1. 价格略高\n2. 需要坚持使用\n\n综合评分：⭐⭐⭐⭐\n#测评 #${topic}`,
      '日常': `今日份${topic}打卡📅\n\n不知不觉已经用了${topic}一个月了\n说说最近的感受～\n\n#日常 #${topic} #生活记录`,
    };
    setOutput(templates[style] || templates['种草']);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">产品/主题</label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="输入要写的内容..." className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink" />
      </div>
      <div>
        <label className="lbl">文案风格</label>
        <div className="flex gap-2 flex-wrap">
          {styles.map(s => <button key={s} onClick={() => setStyle(s)} className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${style === s ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}>{s}</button>)}
        </div>
      </div>
      <button onClick={generate} disabled={!topic.trim()} className="btn-a w-full">生成小红书文案</button>
      {output && (
        <div className="bg-paper rounded-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-2">文案</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-accent">复制</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-ink">{output}</pre>
        </div>
      )}
    </div>
  );
}
