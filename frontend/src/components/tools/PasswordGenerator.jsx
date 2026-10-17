import { useState, useMemo } from 'react';
import Icon from '../Icons';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(7, score);
  }, [password]);

  const strengthLabel = useMemo(() => {
    if (strength <= 2) return { label: '弱', color: 'text-danger', bg: 'bg-danger' };
    if (strength <= 4) return { label: '中', color: 'text-warning', bg: 'bg-warning' };
    if (strength <= 5) return { label: '强', color: 'text-accent', bg: 'bg-accent' };
    return { label: '极强', color: 'text-success', bg: 'bg-success' };
  }, [strength]);

  const generate = () => {
    let chars = '';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (excludeAmbiguous) {
      chars = chars.replace(/[0OIl1|]/g, '');
    }
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    
    let pwd = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setPassword(pwd);
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface-2 rounded-card p-6 text-center">
        <div className="text-2xl font-mono font-bold text-ink break-all min-h-[2rem]">{password || '点击生成'}</div>
        {password && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${strengthLabel.bg}`}></div>
            <span className={`text-sm font-medium ${strengthLabel.color}`}>{strengthLabel.label}</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-2">密码长度</span>
          <span className="font-medium text-accent">{length}</span>
        </div>
        <input type="range" min="4" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} className="slider" />
        <div className="flex justify-between text-xs text-ink-3 mt-1">
          <span>4</span>
          <span>64</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '大写字母', checked: uppercase, set: setUppercase, desc: 'A-Z' },
          { label: '小写字母', checked: lowercase, set: setLowercase, desc: 'a-z' },
          { label: '数字', checked: numbers, set: setNumbers, desc: '0-9' },
          { label: '特殊符号', checked: symbols, set: setSymbols, desc: '!@#$%^&*' },
        ].map(({ label, checked, set, desc }) => (
          <button
            key={label}
            onClick={() => set(!checked)}
            className={`flex items-center justify-between px-4 py-3 rounded-card border transition-all ${
              checked
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line text-ink-3'
            }`}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs font-mono">{desc}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? 'border-accent bg-accent' : 'border-line-2'}`}>
              {checked && <Icon name="check" className="sz12 text-accent-fg" />}
            </div>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 cursor-pointer min-h-8">
        <input
          type="checkbox"
          checked={excludeAmbiguous}
          onChange={(e) => setExcludeAmbiguous(e.target.checked)}
          className="w-4 h-4 rounded border-line-2 text-accent focus:ring-accent-soft"
        />
        <span className="text-sm text-ink-2">排除易混淆字符 (0OIl1)</span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={generate}
          className="btn-a flex-1 transition-colors"
        >
          生成密码
        </button>
        {password && (
          <button
            onClick={copyPassword}
            className={`px-6 py-3 font-semibold rounded-card transition-all ${
              copied ? 'bg-success text-accent-fg' : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
            }`}
          >
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  );
}
