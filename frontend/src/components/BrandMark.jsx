import React from 'react';

/**
 * BrandMark — 站标「三线」
 *
 * 三条圆头线＝站内三条线路；中间那条钴蓝只走到一半、末端一颗点＝当前正在解析的这条。
 * viewBox 取描边后的实际墨迹范围（x 3.7..24.3 / y 7.1..20.9）再四边各留 0.5 余量防圆头被切，
 * 所以盒子≈可见边缘：能和正文左对齐，gap 就是真实视觉间距，不需要负 margin 去校。
 *
 * 颜色不再写死 Tailwind 类，统一走 index.css 的 .mk/.ln/.knob —— 结构线 = --ink-3，
 * 强调线 + 端点 = --accent，深浅色由 token 自动翻，测量值见 index.css 注释。
 * 对白底：--ink-3 #656c75 = 5.31:1、--accent #1c47d6 = 7.19:1（非文本要求 3:1）；
 * 对深色纸 --paper #0e1116：--ink-3 #8d97a3、--accent #7c96ef = 6.72:1。
 */
export default function BrandMark({ className = '' }) {
  return (
    <svg className={`mk ${className}`.trim()} viewBox="3.2 6.6 21.6 14.8" aria-hidden="true" focusable="false">
      <path className="ln" d="M5 8.4H23" />
      <path className="ln acc" d="M5 14h9.8" />
      <path className="ln" d="M5 19.6H20" />
      <circle className="knob" cx="20.4" cy="14" r="2.9" />
    </svg>
  );
}
