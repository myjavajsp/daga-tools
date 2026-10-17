import { useState } from 'react';
export default function BmiCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h <= 0) return;
    const value = w / (h * h);
    setBmi(value.toFixed(1));
    if (value < 18.5) setCategory({ text: '偏瘦', color: 'text-accent', bg: 'bg-accent-soft' });
    else if (value < 24) setCategory({ text: '正常', color: 'text-success', bg: 'bg-success-soft' });
    else if (value < 28) setCategory({ text: '偏重', color: 'text-warning', bg: 'bg-warning-soft' });
    else setCategory({ text: '肥胖', color: 'text-danger', bg: 'bg-danger-soft' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="lbl">体重 (kg)</label>
          <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="65" className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft" />
        </div>
        <div>
          <label className="lbl">身高 (cm)</label>
          <input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="170" className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft" />
        </div>
      </div>
      <button onClick={calculate} disabled={!weight || !height} className="btn-a w-full transition-colors">
        计算BMI
      </button>
      {bmi && (
        <div className="text-center space-y-3">
          <div className="text-7xl font-bold text-ink">{bmi}</div>
          <div className={`inline-block px-6 py-2 rounded-card text-lg font-medium ${category?.bg} ${category?.color}`}>
            {category?.text}
          </div>
          <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                parseFloat(bmi) < 18.5 ? 'bg-accent' :
                parseFloat(bmi) < 24 ? 'bg-success' :
                parseFloat(bmi) < 28 ? 'bg-warning' : 'bg-danger'
              }`}
              style={{ width: `${Math.min(100, (parseFloat(bmi) / 40) * 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-ink-3">
            <div>偏瘦<br/>&lt;18.5</div>
            <div>正常<br/>18.5-24</div>
            <div>偏重<br/>24-28</div>
            <div>肥胖<br/>&gt;28</div>
          </div>
        </div>
      )}
    </div>
  );
}
