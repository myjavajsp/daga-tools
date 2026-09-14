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
    if (value < 18.5) setCategory({ text: '偏瘦', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' });
    else if (value < 24) setCategory({ text: '正常', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' });
    else if (value < 28) setCategory({ text: '偏重', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' });
    else setCategory({ text: '肥胖', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">体重 (kg)</label>
          <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="65" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">身高 (cm)</label>
          <input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="170" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
      </div>
      <button onClick={calculate} disabled={!weight || !height} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">
        计算BMI
      </button>
      {bmi && (
        <div className="text-center space-y-3">
          <div className="text-7xl font-bold text-gray-900 dark:text-white">{bmi}</div>
          <div className={`inline-block px-6 py-2 rounded-xl text-lg font-medium ${category?.bg} ${category?.color}`}>
            {category?.text}
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                parseFloat(bmi) < 18.5 ? 'bg-blue-500' :
                parseFloat(bmi) < 24 ? 'bg-green-500' :
                parseFloat(bmi) < 28 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (parseFloat(bmi) / 40) * 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400">
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
