import { useState } from 'react';

export default function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');

  const units = {
    length: {
      m: { name: '米 (m)', rate: 1 },
      km: { name: '千米 (km)', rate: 1000 },
      cm: { name: '厘米 (cm)', rate: 0.01 },
      mm: { name: '毫米 (mm)', rate: 0.001 },
      mi: { name: '英里 (mi)', rate: 1609.34 },
      yd: { name: '码 (yd)', rate: 0.9144 },
      ft: { name: '英尺 (ft)', rate: 0.3048 },
      in: { name: '英寸 (in)', rate: 0.0254 },
    },
    weight: {
      kg: { name: '千克 (kg)', rate: 1 },
      g: { name: '克 (g)', rate: 0.001 },
      mg: { name: '毫克 (mg)', rate: 0.000001 },
      lb: { name: '磅 (lb)', rate: 0.453592 },
      oz: { name: '盎司 (oz)', rate: 0.0283495 },
      t: { name: '吨 (t)', rate: 1000 },
    },
    temperature: {
      C: { name: '摄氏度 (°C)', rate: 1 },
      F: { name: '华氏度 (°F)', rate: 1 },
      K: { name: '开尔文 (K)', rate: 1 },
    },
    area: {
      m2: { name: '平方米 (m²)', rate: 1 },
      km2: { name: '平方千米 (km²)', rate: 1000000 },
      ha: { name: '公顷 (ha)', rate: 10000 },
      acre: { name: '英亩 (acre)', rate: 4046.86 },
      ft2: { name: '平方英尺 (ft²)', rate: 0.092903 },
    },
    volume: {
      L: { name: '升 (L)', rate: 1 },
      mL: { name: '毫升 (mL)', rate: 0.001 },
      gal: { name: '加仑 (gal)', rate: 3.78541 },
      ft3: { name: '立方英尺 (ft³)', rate: 28.3168 },
    },
  };

  const categories = Object.keys(units);

  const convert = (val, from, to) => {
    if (!val || isNaN(val)) return '';
    
    const fromRate = units[category][from].rate;
    const toRate = units[category][to].rate;
    
    if (category === 'temperature') {
      let celsius;
      // 转换为摄氏度
      if (from === 'C') celsius = val;
      else if (from === 'F') celsius = (val - 32) * 5/9;
      else if (from === 'K') celsius = val - 273.15;
      
      // 从摄氏度转换
      if (to === 'C') return celsius;
      if (to === 'F') return celsius * 9/5 + 32;
      if (to === 'K') return celsius + 273.15;
    }
    
    const result = (val * fromRate) / toRate;
    return parseFloat(result.toFixed(6));
  };

  const handleCalculate = () => {
    const converted = convert(Number(value), fromUnit, toUnit);
    setResult(converted);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const firstUnit = Object.keys(units[cat])[0];
    const secondUnit = Object.keys(units[cat])[1];
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
    setValue('');
    setResult('');
  };

  return (
    <div className="space-y-6">
      {/* 分类选择 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat === 'length' && '📏 长度'}
            {cat === 'weight' && '⚖️ 重量'}
            {cat === 'temperature' && '🌡️ 温度'}
            {cat === 'area' && '📐 面积'}
            {cat === 'volume' && '🧪 体积'}
          </button>
        ))}
      </div>

      {/* 单位选择 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            从
          </label>
          <select
            value={fromUnit}
            onChange={(e) => { setFromUnit(e.target.value); setResult(''); }}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {Object.entries(units[category]).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            到
          </label>
          <select
            value={toUnit}
            onChange={(e) => { setToUnit(e.target.value); setResult(''); }}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {Object.entries(units[category]).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 数值输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          输入数值
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
          placeholder="请输入要转换的数值..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {/* 计算按钮 */}
      <button
        onClick={handleCalculate}
        disabled={!value}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        转换
      </button>

      {/* 结果展示 */}
      {result !== '' && result !== undefined && (
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">转换结果</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {result}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {units[category][fromUnit].name} = {result} {units[category][toUnit].name}
          </div>
        </div>
      )}

      {/* 常用换算表 */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">常用换算参考</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          {category === 'length' && (
            <>
              <div>1 km = 1000 m</div>
              <div>1 m = 3.281 ft</div>
              <div>1 mi = 1.609 km</div>
              <div>1 in = 2.54 cm</div>
            </>
          )}
          {category === 'weight' && (
            <>
              <div>1 kg = 2.205 lb</div>
              <div>1 lb = 0.454 kg</div>
              <div>1 oz = 28.35 g</div>
              <div>1 t = 1000 kg</div>
            </>
          )}
          {category === 'temperature' && (
            <>
              <div>0°C = 32°F</div>
              <div>100°C = 212°F</div>
              <div>室温 ≈ 25°C</div>
              <div>体温 ≈ 37°C</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
