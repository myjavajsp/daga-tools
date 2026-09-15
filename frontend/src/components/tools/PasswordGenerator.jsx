import { useState, useMemo } from 'react';
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
    if (strength <= 2) return { label: '弱', color: 'text-red-500', bg: 'bg-red-500' };
    if (strength <= 4) return { label: '中', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (strength <= 5) return { label: '强', color: 'text-blue-500', bg: 'bg-blue-500' };
    return { label: '极强', color: 'text-green-500', bg: 'bg-green-500' };
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center">
        <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white break-all min-h-[2rem]">{password || '点击生成'}</div>
        {password && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${strengthLabel.bg}`}></div>
            <span className={`text-sm font-medium ${strengthLabel.color}`}>{strengthLabel.label}</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">密码长度</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{length}</span>
        </div>
        <input type="range" min="4" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
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
            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
              checked
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs font-mono">{desc}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
              {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
            </div>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={excludeAmbiguous}
          onChange={(e) => setExcludeAmbiguous(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">排除易混淆字符 (0OIl1)</span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={generate}
          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          生成密码
        </button>
        {password && (
          <button
            onClick={copyPassword}
            className={`px-6 py-3 font-semibold rounded-xl transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  );
}
