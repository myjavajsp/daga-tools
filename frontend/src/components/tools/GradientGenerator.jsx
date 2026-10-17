import { useState } from 'react';

const TYPES = [
  { id: 'linear', label: '线性渐变' },
  { id: 'radial', label: '径向渐变' },
];

/**
 * 注意：这里出现的 linear-/radial-gradient 是工具的产品输出，不是页面装饰，
 * 属于「明亮清爽 v5」禁用渐变规则的唯一例外（同 ImageCrop 的透明棋盘格）。
 */
export default function GradientGenerator() {
  const [color1, setColor1] = useState('#3B82F6');
  const [color2, setColor2] = useState('#8B5CF6');
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState('linear');
  const [copied, setCopied] = useState(false);

  const cssValue =
    type === 'linear'
      ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
      : `radial-gradient(circle, ${color1}, ${color2})`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`background: ${cssValue};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板被浏览器拒绝时不做假提示 */
    }
  };

  const swatch = (label, value, setValue) => (
    <div className="min-w-0">
      <label className="lbl">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`${label}取色`}
          className="swatch"
        />
        {/* 旧版这里少了 min-w-0：type=text 的 input 有 ~194px 的固有宽度，
            在 grid-cols-2 的半宽格子里把整页撑到 396px（实测横向溢出）。 */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`${label}色值`}
          className="input mono min-w-0 flex-1"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="h-40 w-full rounded-card border border-line" style={{ background: cssValue }} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {swatch('颜色 1', color1, setColor1)}
        {swatch('颜色 2', color2, setColor2)}
      </div>

      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            aria-pressed={type === t.id}
            className={
              'min-h-10 flex-1 rounded-sm text-sm font-medium transition-colors ' +
              (type === t.id
                ? 'bg-accent text-accent-fg'
                : 'bg-surface-2 text-ink-2 hover:bg-accent-soft hover:text-accent-press')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === 'linear' && (
        <div>
          <label className="lbl" htmlFor="gg-angle">角度 {angle}°</label>
          <input
            id="gg-angle"
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="lbl mb-0">CSS 代码</label>
          <button onClick={copy} className="btn-ghost min-h-9 px-3 text-xs">
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <code className="mono block break-all rounded-card bg-surface p-3 text-sm text-ink-2">
          background: {cssValue};
        </code>
      </div>
    </div>
  );
}
