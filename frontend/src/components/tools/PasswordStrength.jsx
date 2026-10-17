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
        <label className="lbl">密码</label>
        <div className="relative">
          <input type="text" value={password} onChange={e => { setPassword(e.target.value); check(e.target.value); }} placeholder="输入密码检测强度..." className="w-full px-4 py-3 pr-20 bg-paper border border-line rounded-card text-ink font-mono focus:outline-none focus:ring-2 focus:ring-accent-soft" />
          <div className="absolute right-2 top-2 flex gap-1">
            {password && <button onClick={() => navigator.clipboard.writeText(password)} className="px-2 py-1 text-xs text-ink-3 hover:text-ink bg-surface-2 rounded-lg">复制</button>}
            <button onClick={generate} className="act px-2 py-1 bg-accent-soft rounded-lg">生成</button>
          </div>
        </div>
      </div>
      {password && (
        <>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i <= score ? (score <= 2 ? 'bg-danger' : score <= 4 ? 'bg-warning' : 'bg-success') : 'bg-surface-2'}`} />
            ))}
          </div>
          <div className="text-center">
            <span className={`text-lg font-bold ${score <= 2 ? 'text-danger' : score <= 4 ? 'text-warning' : 'text-success'}`}>
              {score <= 2 ? '弱' : score <= 4 ? '中' : '强'}
            </span>
          </div>
          {tips.length > 0 && (
            <div className="bg-warning-soft border border-line rounded-card p-4">
              <div className="text-sm font-medium text-warning mb-2">改进建议</div>
              <ul className="text-xs text-warning space-y-1">
                {tips.map((tip, i) => <li key={i}>• {tip}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
