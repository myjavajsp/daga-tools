import { useState } from 'react';
export default function PasswordStrength() {
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [tips, setTips] = useState([]);

  const check = (pwd) => {
    if (!pwd) { setScore(0); setTips([]); return; }
    let s = 0;
    const t = [];
    if (pwd.length >= 8) s++; else t.push('至少8个字符');
    if (pwd.length >= 12) s++; else t.push('建议12位以上');
    if (/[a-z]/.test(pwd)) s++; else t.push('添加小写字母');
    if (/[A-Z]/.test(pwd)) s++; else t.push('添加大写字母');
    if (/\d/.test(pwd)) s++; else t.push('添加数字');
    if (/[!@#$%^&*]/.test(pwd)) s++; else t.push('添加特殊字符');
    setScore(s);
    setTips(t);
  };

  const generate = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 16; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
    check(pwd);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
        <div className="relative">
          <input type="text" value={password} onChange={e => { setPassword(e.target.value); check(e.target.value); }} placeholder="输入密码检测强度..." className="w-full px-4 py-3 pr-20 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          <div className="absolute right-2 top-2 flex gap-1">
            {password && <button onClick={() => navigator.clipboard.writeText(password)} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-lg">复制</button>}
            <button onClick={generate} className="px-2 py-1 text-xs text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg">生成</button>
          </div>
        </div>
      </div>
      {password && (
        <>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i <= score ? (score <= 2 ? 'bg-red-500' : score <= 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>
          <div className="text-center">
            <span className={`text-lg font-bold ${score <= 2 ? 'text-red-500' : score <= 4 ? 'text-yellow-500' : 'text-green-500'}`}>
              {score <= 2 ? '弱' : score <= 4 ? '中' : '强'}
            </span>
          </div>
          {tips.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">改进建议</div>
              <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                {tips.map((tip, i) => <li key={i}>• {tip}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
