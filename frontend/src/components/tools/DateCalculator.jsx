import { useState } from 'react';

export default function DateCalculator() {
  const [mode, setMode] = useState('diff');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [daysToAdd, setDaysToAdd] = useState(0);
  const [result, setResult] = useState(null);

  const calculateDiff = () => {
    if (!date1 || !date2) return;
    
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    setResult({
      totalDays: diffDays,
      years,
      months,
      days,
      weeks: Math.floor(diffDays / 7),
      hours: diffDays * 24,
    });
  };

  const calculateAdd = () => {
    if (!date1) return;
    
    const date = new Date(date1);
    date.setDate(date.getDate() + Number(daysToAdd));
    
    setResult({
      resultDate: date.toISOString().split('T')[0],
      resultDateFormatted: date.toLocaleDateString('zh-CN'),
      daysAdded: daysToAdd,
    });
  };

  const handleCalculate = () => {
    if (mode === 'diff') {
      calculateDiff();
    } else {
      calculateAdd();
    }
  };

  return (
    <div className="space-y-6">
      {/* 模式选择 */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('diff'); setResult(null); }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'diff'
              ? 'bg-accent text-accent-fg'
              : 'bg-surface-2 text-ink-2'
          }`}
        >
          日期差计算
        </button>
        <button
          onClick={() => { setMode('add'); setResult(null); }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'add'
              ? 'bg-accent text-accent-fg'
              : 'bg-surface-2 text-ink-2'
          }`}
        >
          日期加减
        </button>
      </div>

      {/* 输入区域 */}
      {mode === 'diff' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="lbl">
              开始日期
            </label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
          </div>
          <div>
            <label className="lbl">
              结束日期
            </label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="lbl">
              基准日期
            </label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
          </div>
          <div>
            <label className="lbl">
              加减天数
            </label>
            <input
              type="number"
              value={daysToAdd}
              onChange={(e) => setDaysToAdd(Number(e.target.value))}
              placeholder="输入天数（负数表示向前）"
              className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>
      )}

      {/* 计算按钮 */}
      <button
        onClick={handleCalculate}
        disabled={!date1 || (mode === 'diff' && !date2)}
        className="btn-a w-full disabled:cursor-not-allowed transition-colors"
      >
        计算
      </button>

      {/* 结果展示 */}
      {result && (
        <div className="space-y-4">
          {mode === 'diff' ? (
            <div className="bg-surface-2 rounded-card p-6 text-center">
              <div className="text-4xl font-bold mb-2 text-accent">
                {result.totalDays.toLocaleString()}
              </div>
              <div className="text-ink-2">天</div>
              
              <div className="grid grid-cols-4 gap-3 mt-6">
                <div className="bg-surface rounded-lg p-3">
                  <div className="text-lg font-bold text-ink">{result.years}</div>
                  <div className="text-xs text-ink-3">年</div>
                </div>
                <div className="bg-surface rounded-lg p-3">
                  <div className="text-lg font-bold text-ink">{result.months}</div>
                  <div className="text-xs text-ink-3">月</div>
                </div>
                <div className="bg-surface rounded-lg p-3">
                  <div className="text-lg font-bold text-ink">{result.days}</div>
                  <div className="text-xs text-ink-3">日</div>
                </div>
                <div className="bg-surface rounded-lg p-3">
                  <div className="text-lg font-bold text-ink">{result.weeks}</div>
                  <div className="text-xs text-ink-3">周</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-ink-3">
                共计 {result.hours.toLocaleString()} 小时
              </div>
            </div>
          ) : (
            <div className="bg-surface-2 rounded-card p-6 text-center">
              <div className="text-3xl font-bold text-ink mb-2">
                {result.resultDateFormatted}
              </div>
              <div className="text-ink-2">
                {Number(result.daysAdded) > 0 ? '加上' : '减去'} {Math.abs(result.daysAdded)} 天的结果
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
