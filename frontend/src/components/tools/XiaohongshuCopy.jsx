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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">产品/主题</label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="输入要写的内容..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文案风格</label>
        <div className="flex gap-2 flex-wrap">
          {styles.map(s => <button key={s} onClick={() => setStyle(s)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${style === s ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{s}</button>)}
        </div>
      </div>
      <button onClick={generate} disabled={!topic.trim()} className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">生成小红书文案</button>
      {output && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">文案</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-blue-500">复制</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{output}</pre>
        </div>
      )}
    </div>
  );
}
