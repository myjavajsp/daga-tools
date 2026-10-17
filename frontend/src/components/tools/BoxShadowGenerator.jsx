import { useState } from 'react';
export default function BoxShadowGenerator() {
  const [h, setH] = useState(5);
  const [v, setV] = useState(5);
  const [blur, setBlur] = useState(15);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(20);
  const [inset, setInset] = useState(false);

  const shadow = inset
    ? `inset ${h}px ${v}px ${blur}px ${spread}px ${color}${Math.round(opacity/100*255).toString(16).padStart(2,'0')}`
    : `${h}px ${v}px ${blur}px ${spread}px ${color}${Math.round(opacity/100*255).toString(16).padStart(2,'0')}`;

  const cssCode = `box-shadow: ${shadow};`;

  return (
    <div className="space-y-6">
      <div
        className="w-full h-40 rounded-card flex items-center justify-center transition-all"
        style={{ boxShadow: shadow, background: '#f9fafb' }}
      >
        <div className="w-20 h-20 bg-surface rounded-lg shadow-sm"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: '水平偏移', val: h, set: setH, min: -50, max: 50 },
          { label: '垂直偏移', val: v, set: setV, min: -50, max: 50 },
          { label: '模糊', val: blur, set: setBlur, min: 0, max: 100 },
          { label: '扩展', val: spread, set: setSpread, min: -50, max: 50 },
        ].map(({ label, val, set, min, max }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-ink-2">{label}</span>
              <span className="font-mono text-ink">{val}px</span>
            </div>
            <input type="range" min={min} max={max} value={val} onChange={e=>set(Number(e.target.value))} className="slider" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="lbl">颜色</label>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="swatch" />
            <input type="text" value={color} onChange={e=>setColor(e.target.value)} className="flex-1 px-3 py-2 bg-paper border border-line rounded-lg text-ink font-mono text-sm" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink-2">透明度</span>
            <span className="font-mono text-ink">{opacity}%</span>
          </div>
          <input type="range" min="0" max="100" value={opacity} onChange={e=>setOpacity(Number(e.target.value))} className="slider" />
        </div>
      </div>

      <button
        onClick={() => setInset(!inset)}
        className={`w-full py-2 rounded-card text-sm font-medium transition-all ${inset ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'}`}
      >
        {inset ? '内置阴影' : '外置阴影'}
      </button>

      <div className="flex items-center justify-between bg-paper rounded-card p-3">
        <code className="text-sm font-mono text-ink-2 break-all">{cssCode}</code>
        <button
          onClick={() => navigator.clipboard.writeText(cssCode)}
          className="act ml-2 shrink-0"
        >
          复制
        </button>
      </div>
    </div>
  );
}
