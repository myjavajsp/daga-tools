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
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          日期差计算
        </button>
        <button
          onClick={() => { setMode('add'); setResult(null); }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'add'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          日期加减
        </button>
      </div>

      {/* 输入区域 */}
      {mode === 'diff' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              开始日期
            </label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              结束日期
            </label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              基准日期
            </label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              加减天数
            </label>
            <input
              type="number"
              value={daysToAdd}
              onChange={(e) => setDaysToAdd(Number(e.target.value))}
              placeholder="输入天数（负数表示向前）"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>
      )}

      {/* 计算按钮 */}
      <button
        onClick={handleCalculate}
        disabled={!date1 || (mode === 'diff' && !date2)}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        计算
      </button>

      {/* 结果展示 */}
      {result && (
        <div className="space-y-4">
          {mode === 'diff' ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {result.totalDays.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">天</div>
              
              <div className="grid grid-cols-4 gap-3 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{result.years}</div>
                  <div className="text-xs text-gray-500">年</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{result.months}</div>
                  <div className="text-xs text-gray-500">月</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{result.days}</div>
                  <div className="text-xs text-gray-500">日</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{result.weeks}</div>
                  <div className="text-xs text-gray-500">周</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                共计 {result.hours.toLocaleString()} 小时
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {result.resultDateFormatted}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {Number(result.daysAdded) > 0 ? '加上' : '减去'} {Math.abs(result.daysAdded)} 天的结果
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
