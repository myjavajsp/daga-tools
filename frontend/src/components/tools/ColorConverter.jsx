import { useState, useMemo } from 'react';

/**
 * 颜色转换器
 *
 * 旧实现的毛病：改动 HSL 时只是拿旧的 rgb 重新拼一遍 hex（注释里甚至写着
 * "Simple conversion approximation for demo"），根本没有做 HSL -> RGB 的换算，
 * 所以拖 H/S/L 三个滑块结果全错。
 *
 * 现在的做法：RGB 是唯一数据源，HEX / HSL 都是它的派生值；
 * 任何一处输入都会经由标准算法同步到另外两处。
 */

/** 钳制到 [min,max] 的整数 */
function clamp(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** RGB -> HEX */
function rgbToHex({ r, g, b }) {
  return (
    '#' +
    [r, g, b]
      .map((v) => clamp(v, 0, 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** 规整 HEX：支持带不带 #、支持 #abc 简写；非法返回 null */
function normalizeHex(input) {
  let s = String(input ?? '')
    .trim()
    .replace(/^#/, '');
  if (/^[a-f\d]{3}$/i.test(s)) s = s.split('').map((c) => c + c).join('');
  return /^[a-f\d]{6}$/i.test(s) ? '#' + s.toUpperCase() : null;
}

/** HEX -> RGB */
function hexToRgb(input) {
  const norm = normalizeHex(input);
  if (!norm) return null;
  return {
    r: parseInt(norm.slice(1, 3), 16),
    g: parseInt(norm.slice(3, 5), 16),
    b: parseInt(norm.slice(5, 7), 16),
  };
}

/** RGB -> HSL（标准算法） */
function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** HSL -> RGB（标准算法） */
function hslToRgb(h, s, l) {
  const hn = ((((h % 360) + 360) % 360) / 360);
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  const hue2rgb = (t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  return {
    r: Math.round(hue2rgb(hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(hn) * 255),
    b: Math.round(hue2rgb(hn - 1 / 3) * 255),
  };
}

/** WCAG 相对亮度 */
function relativeLuminance({ r, g, b }) {
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** 与白/黑文字的对比度，给出建议文字色 */
function textAdvice(rgb) {
  const L = relativeLuminance(rgb);
  const onWhite = (Math.max(L, 1) + 0.05) / (Math.min(L, 1) + 0.05);
  const onBlack = (L + 0.05) / 0.05;
  const ratio = onBlack / onWhite; // >1 说明黑字更清楚
  return {
    best: ratio >= 1 ? '黑' : '白',
    ratio: (ratio >= 1 ? onBlack : onWhite).toFixed(2),
  };
}

const PRESETS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6',
  '#8B5CF6', '#EC4899', '#64748B', '#1F2937', '#F9FAFB', '#000000',
];

const inputCls =
  'w-full mt-1 px-3 py-2 bg-paper border border-line rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft';

export default function ColorConverter() {
  // RGB 是唯一数据源
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hexText, setHexText] = useState('#3B82F6');
  // draft：正在编辑的输入框原文，避免边打字边被格式化
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const hex = useMemo(() => rgbToHex(rgb), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const advice = useMemo(() => textAdvice(rgb), [rgb]);

  /** 统一落点：任何来源最终都收敛到 RGB，再同步三个显示值 */
  const commitRgb = (next) => {
    const clean = {
      r: clamp(next.r, 0, 255),
      g: clamp(next.g, 0, 255),
      b: clamp(next.b, 0, 255),
    };
    setRgb(clean);
    setHexText(rgbToHex(clean));
    setError('');
  };

  const handleHex = (val) => {
    setHexText(val);
    const norm = normalizeHex(val);
    if (!norm) {
      setError('请输入有效的 HEX 颜色，如 #3B82F6 或 #3B8');
      return;
    }
    commitRgb(hexToRgb(norm));
  };

  /** RGB / HSL 数字框：原文进 draft，解析成功才真正改色 */
  const handleNum = (group, key, max, text) => {
    setDraft({ group, key, text });
    if (text === '') return; // 允许用户清空后重新输入
    const n = Number(text);
    if (!Number.isFinite(n)) return;
    if (group === 'rgb') commitRgb({ ...rgb, [key]: clamp(n, 0, max) });
    else {
      const next = { ...hsl, [key]: clamp(n, 0, max) };
      commitRgb(hslToRgb(next.h, next.s, next.l));
    }
  };

  /** 数字框显示值：正在编辑用原文，否则用派生值 */
  const shown = (group, key, value) =>
    draft && draft.group === group && draft.key === key ? draft.text : String(value);

  const copy = async (text, tag) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setError('复制失败，请手动选择文本');
    }
  };

  const RGB_FIELDS = [
    { key: 'r', label: 'R', cls: 'text-danger' },
    { key: 'g', label: 'G', cls: 'text-success' },
    { key: 'b', label: 'B', cls: 'text-accent' },
  ];
  const HSL_FIELDS = [
    { key: 'h', label: 'H', unit: '°', max: 360 },
    { key: 's', label: 'S', unit: '%', max: 100 },
    { key: 'l', label: 'L', unit: '%', max: 100 },
  ];

  const CopyBtn = ({ text, tag }) => (
    <button onClick={() => copy(text, tag)} className="act">
      {copied === tag ? '已复制' : '复制'}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* 预览 */}
      <div>
        <div
          className="w-full h-28 rounded-card border-2 border-line flex items-center justify-center"
          style={{ backgroundColor: hex }}
        >
          {/* 色块上只放大号 Aa。原来这里是 12px 的 HEX 文字，底是用户随便选的色，
              怎么调都过不了正文 4.5:1（实测 3.30:1）；放大到 30px 就落进大字号的 3:1 档，
              而这恰好也是这个工具要演示的东西 —— 建议色在这块底上到底够不够清楚。 */}
          <span
            className="text-3xl font-bold"
            style={{ color: advice.best === '黑' ? '#111827' : '#FFFFFF' }}
          >
            Aa
          </span>
        </div>
        <p className="mt-2 text-xs text-ink-3">
          <span className="mono text-ink">{hex}</span> 色块上建议用{advice.best}色文字（对比度 {advice.ratio}:1）
        </p>
      </div>

      {/* HEX */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="lbl">HEX</label>
          <CopyBtn text={hex} tag="hex" />
        </div>
        <input
          type="text"
          value={hexText}
          onChange={(e) => handleHex(e.target.value)}
          onBlur={() => setHexText(hex)}
          onFocus={(e) => e.target.select()}
          placeholder="#3B82F6"
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink font-mono focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      {/* RGB */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="lbl">RGB</label>
          <CopyBtn text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} tag="rgb" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {RGB_FIELDS.map(({ key, label, cls }) => (
            <div key={key}>
              <span className={`text-xs font-medium ${cls}`}>{label}</span>
              <input
                type="number"
                min="0"
                max="255"
                value={shown('rgb', key, rgb[key])}
                onChange={(e) => handleNum('rgb', key, 255, e.target.value)}
                onBlur={() => setDraft(null)}
                onFocus={(e) => e.target.select()}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>

      {/* HSL */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="lbl">HSL</label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {HSL_FIELDS.map(({ key, label, unit, max }) => (
            <div key={key}>
              <span className="text-xs font-medium text-ink-3">{label}</span>
              <input
                type="number"
                min="0"
                max={max}
                value={shown('hsl', key, hsl[key])}
                onChange={(e) => handleNum('hsl', key, max, e.target.value)}
                onBlur={() => setDraft(null)}
                onFocus={(e) => e.target.select()}
                className={inputCls}
              />
              <span className="text-xs text-ink-3">{unit}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <code className="text-xs text-ink-3 font-mono">
            hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
          </code>
          <CopyBtn text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} tag="hsl" />
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {/* 预设色 */}
      <div>
        <label className="lbl">预设色</label>
        <div className="grid grid-cols-6 gap-2">
          {PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => handleHex(c)}
              className="w-full h-10 rounded-lg border-2 border-line hover:scale-105 transition-transform"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
