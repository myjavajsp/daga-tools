import { useState } from 'react';
export default function ColorConverter() {
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [error, setError] = useState('');

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const handleHexChange = (val) => {
    setHex(val);
    const rgbVal = hexToRgb(val);
    if (rgbVal) {
      setRgb(rgbVal);
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
      setError('');
    } else {
      setError('无效的十六进制颜色');
    }
  };

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: Math.min(255, Math.max(0, Number(value))) };
    setRgb(newRgb);
    const h = Math.round(360 * ({ r: 0, g: 1/3, b: 2/3 }[channel] || 0) + 0);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    setHex('#' + Object.values(newRgb).map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase());
    setError('');
  };

  const copyColor = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div
        className="w-full h-24 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-inner"
        style={{ backgroundColor: hex }}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">HEX</label>
          <button onClick={() => copyColor(hex)} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
        </div>
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#3B82F6"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RGB</label>
          <button onClick={() => copyColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'r', label: 'R', color: 'text-red-500' },
            { key: 'g', label: 'G', color: 'text-green-500' },
            { key: 'b', label: 'B', color: 'text-blue-500' },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <span className={`text-xs font-medium ${color}`}>{label}</span>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb[key]}
                onChange={(e) => handleRgbChange(key, e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">HSL</label>
          <button onClick={() => copyColor(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'h', label: 'H', unit: '°' },
            { key: 's', label: 'S', unit: '%' },
            { key: 'l', label: 'L', unit: '%' },
          ].map(({ key, label, unit }) => (
            <div key={key}>
              <span className="text-xs font-medium text-gray-500">{label}</span>
              <input
                type="number"
                min={key === 'h' ? 0 : 0}
                max={key === 'h' ? 360 : 100}
                value={hsl[key]}
                onChange={(e) => {
                  const v = Math.min(key === 'h' ? 360 : 100, Math.max(0, Number(e.target.value)));
                  const newHsl = { ...hsl, [key]: v };
                  setHsl(newHsl);
                  const r = v / 360;
                  // Simple conversion approximation for demo
                  const hexVal = '#' + Object.values(rgb).map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
                  setHex(hexVal);
                }}
                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <span className="text-xs text-gray-400">{unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'].map((c) => (
          <button
            key={c}
            onClick={() => handleHexChange(c)}
            className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
