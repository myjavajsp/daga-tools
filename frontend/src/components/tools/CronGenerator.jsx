import { useState } from 'react';
export default function CronGenerator() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState('*');
  const [hours, setHours] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [expression, setExpression] = useState('');
  const [nextTimes, setNextTimes] = useState([]);

  const generate = () => {
    const expr = `${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setExpression(expr);
    const times = getNextOccurrences(expr, 5);
    setNextTimes(times);
  };

  const getNextOccurrences = (expr, count) => {
    const parts = expr.split(' ').map(p => parseInt(p) || 0);
    const times = [];
    const now = new Date();
    for (let i = 0; i < 10000 && times.length < count; i++) {
      const d = new Date(now.getTime() + i * 60000);
      if (matches(d, expr)) {
        times.push(d.toLocaleString('zh-CN'));
      }
    }
    return times;
  };

  const matches = (date, expr) => {
    const [s, m, h, dom, mon, dow] = expr.split(' ').map(p => {
      if (p === '*') return -1;
      const n = parseInt(p);
      return isNaN(n) ? -1 : n;
    });
    if (s >= 0 && date.getSeconds() !== s) return false;
    if (m >= 0 && date.getMinutes() !== m) return false;
    if (h >= 0 && date.getHours() !== h) return false;
    if (dom >= 0 && date.getDate() !== dom) return false;
    if (mon >= 0 && date.getMonth() + 1 !== mon) return false;
    if (dow >= 0 && date.getDay() !== dow) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: '秒', val: seconds, set: setSeconds, min: 0, max: 59 },
          { label: '分', val: minutes, set: setMinutes, min: 0, max: 59, free: true },
          { label: '时', val: hours, set: setHours, min: 0, max: 23, free: true },
          { label: '日', val: dayOfMonth, set: setDayOfMonth, min: 1, max: 31, free: true },
          { label: '月', val: month, set: setMonth, min: 1, max: 12, free: true },
          { label: '周', val: dayOfWeek, set: setDayOfWeek, min: 0, max: 6, free: true },
        ].map(({ label, val, set, min, max, free }) => (
          <div key={label}>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{label}</label>
            {free ? (
              <input
                type="text"
                value={val}
                onChange={e => set(e.target.value)}
                placeholder="*"
                className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-sm font-mono text-gray-900 dark:text-white"
              />
            ) : (
              <select
                value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-sm text-gray-900 dark:text-white"
              >
                {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={generate}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        生成表达式
      </button>

      {expression && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <code className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">{expression}</code>
          </div>

          {nextTimes.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">下次执行时间</div>
              <div className="space-y-1">
                {nextTimes.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
                    <span className="text-xs text-gray-400 w-6">#{i + 1}</span>
                    <code className="font-mono text-gray-700 dark:text-gray-300">{t}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">常用Cron表达式</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { expr: '* * * * * *', label: '每秒' },
            { expr: '0 * * * * *', label: '每分钟' },
            { expr: '0 0 * * * *', label: '每天0点' },
            { expr: '0 0 0 * * *', label: '每天凌晨' },
            { expr: '0 9 * * 1-5', label: '工作日9点' },
            { expr: '0 0 1 * *', label: '每月1号' },
          ].map(({ expr, label }) => (
            <button
              key={expr}
              onClick={() => { setExpression(expr); setNextTimes(getNextOccurrences(expr, 3)); }}
              className="text-left px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="font-medium text-gray-700 dark:text-gray-300">{label}</div>
              <code className="text-xs text-blue-600 dark:text-blue-400">{expr}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
