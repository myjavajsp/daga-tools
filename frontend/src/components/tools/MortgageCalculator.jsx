import { useState } from 'react';
export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState('100');
  const [years, setYears] = useState('20');
  const [rate, setRate] = useState('4.9');
  const [method, setMethod] = useState('equalPrincipal');
  const [result, setResult] = useState(null);

  const calc = () => {
    const P = parseFloat(loanAmount) * 10000;
    const annualRate = parseFloat(rate) / 100;
    const monthlyRate = annualRate / 12;
    const n = parseInt(years) * 12;

    let monthlyPayment, totalInterest, totalPayment;
    if (method === 'equalPrincipal') {
      const monthlyPrincipal = P / n;
      let totalInt = 0;
      for (let i = 0; i < n; i++) {
        totalInt += (P - monthlyPrincipal * i) * monthlyRate;
      }
      monthlyPayment = monthlyPrincipal + P * monthlyRate;
      totalInterest = totalInt;
      totalPayment = P + totalInt;
    } else {
      const factor = Math.pow(1 + monthlyRate, n);
      monthlyPayment = P * monthlyRate * factor / (factor - 1);
      totalInterest = monthlyPayment * n - P;
      totalPayment = monthlyPayment * n;
    }

    setResult({
      monthly: method === 'equalPrincipal' ? Math.round(monthlyPayment * 100) / 100 : Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      firstMonth: method === 'equalPrincipal' ? Math.round((P/n + P*monthlyRate)*100)/100 : null,
      lastMonth: method === 'equalPrincipal' ? Math.round((P/n + P/n*(1-monthlyRate*n))*100)/100 : null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">贷款金额(万)</label>
          <input type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">贷款年限</label>
          <input type="number" value={years} onChange={e=>setYears(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">年利率(%)</label>
          <input type="number" step="0.1" value={rate} onChange={e=>setRate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>setMethod('equalPrincipal')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${method==='equalPrincipal'?'bg-blue-500 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>等额本金</button>
        <button onClick={()=>setMethod('equalPayment')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${method==='equalPayment'?'bg-blue-500 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>等额本息</button>
      </div>

      <button onClick={calc} disabled={!loanAmount||!years||!rate} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">
        计算
      </button>

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">月供(首月)</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.firstMonth ? `¥${result.firstMonth.toLocaleString()}` : `¥${result.monthly.toLocaleString()}`}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">总利息</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">¥{(result.totalInterest/10000).toFixed(2)}万</div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">还款总额</span><span className="font-medium text-gray-900 dark:text-white">¥{(result.totalPayment/10000).toFixed(2)}万</span></div>
            {method==='equalPrincipal'&&<div className="flex justify-between mt-1"><span className="text-gray-500 dark:text-gray-400">月供(末月)</span><span className="font-medium text-gray-900 dark:text-white">¥{result.lastMonth?.toLocaleString()}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
