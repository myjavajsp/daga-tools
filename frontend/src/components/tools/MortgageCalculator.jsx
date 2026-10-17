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
          <label className="lbl">贷款金额(万)</label>
          <input type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft" />
        </div>
        <div>
          <label className="lbl">贷款年限</label>
          <input type="number" value={years} onChange={e=>setYears(e.target.value)} className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft" />
        </div>
        <div>
          <label className="lbl">年利率(%)</label>
          <input type="number" step="0.1" value={rate} onChange={e=>setRate(e.target.value)} className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft" />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>setMethod('equalPrincipal')} className={`flex-1 py-2 rounded-card text-sm font-medium transition-all ${method==='equalPrincipal'?'bg-accent text-accent-fg':'bg-surface-2 text-ink-2'}`}>等额本金</button>
        <button onClick={()=>setMethod('equalPayment')} className={`flex-1 py-2 rounded-card text-sm font-medium transition-all ${method==='equalPayment'?'bg-accent text-accent-fg':'bg-surface-2 text-ink-2'}`}>等额本息</button>
      </div>

      <button onClick={calc} disabled={!loanAmount||!years||!rate} className="btn-a w-full transition-colors">
        计算
      </button>

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-accent-soft border border-line rounded-card p-4 text-center">
              <div className="text-xs text-ink-3 mb-1">月供(首月)</div>
              <div className="text-xl font-bold text-accent">{result.firstMonth ? `¥${result.firstMonth.toLocaleString()}` : `¥${result.monthly.toLocaleString()}`}</div>
            </div>
            <div className="bg-accent-soft border border-line rounded-card p-4 text-center">
              <div className="text-xs text-ink-3 mb-1">总利息</div>
              <div className="text-xl font-bold text-accent">¥{(result.totalInterest/10000).toFixed(2)}万</div>
            </div>
          </div>
          <div className="bg-paper rounded-card p-4 text-sm">
            <div className="flex justify-between"><span className="text-ink-3">还款总额</span><span className="font-medium text-ink">¥{(result.totalPayment/10000).toFixed(2)}万</span></div>
            {method==='equalPrincipal'&&<div className="flex justify-between mt-1"><span className="text-ink-3">月供(末月)</span><span className="font-medium text-ink">¥{result.lastMonth?.toLocaleString()}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
