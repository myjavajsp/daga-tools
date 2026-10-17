import React from 'react';

/**
 * Icon — 全站线性图标（24×24 网格，stroke=currentColor）
 *
 * 「明亮清爽 v5」里唯一允许的图标形式：1.6 描边、圆头圆角、无 emoji、无填充色块。
 * 尺寸与颜色一律由 CSS 的 .ic / .chip / .menu 等类控制，组件只给形状。
 * 需要新图标就往 PATHS 里加，别在业务组件里手写 svg path。
 */
const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4.2-4.2" /></>,
  tools: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </>
  ),
  flame: (
    <>
      <path d="M12 22a6 6 0 0 0 6-6c0-4.6-6-10.5-6-10.5S6 11.4 6 16a6 6 0 0 0 6 6Z" />
      <path d="M12 18.6a2.6 2.6 0 0 0 2.6-2.6c0-2-2.6-4.6-2.6-4.6s-2.6 2.6-2.6 4.6A2.6 2.6 0 0 0 12 18.6Z" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2.2V15" />
      <circle cx="6.4" cy="18" r="2.6" />
      <circle cx="16.4" cy="15" r="2.6" />
    </>
  ),
  sparkles: (
    <>
      <path d="M10 3l1.8 4.6L16.4 9.4 11.8 11.2 10 15.8 8.2 11.2 3.6 9.4 8.2 7.6 10 3Z" />
      <path d="M18 14l.9 2.3 2.3.9-2.3.9L18 20.4l-.9-2.3-2.3-.9 2.3-.9 2.3-.9L18 14Z" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="M8 11l4 3.5L16 11" />
      <path d="M5 19.5h14" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <path d="M14 14h2v2h-2zM18.5 14h2v2h-2zM14 18.5h2v2h-2zM18.5 18.5h2v2h-2z" />
    </>
  ),
  file: (
    <>
      <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8l-4.5-4.5Z" />
      <path d="M13.8 3.6V8H18" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.4" cy="9.9" r="1.5" />
      <path d="M5 17.5l4.6-4.4 3.1 2.9L17.4 11 21 14.6" />
    </>
  ),
  wand: (
    <>
      <path d="M3.5 20.5 13.8 10.2" />
      <path d="M15.2 9 17.5 6.7" />
      <path d="M18.6 2.8l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1 1-2.4Z" />
    </>
  ),
  play: <path d="M8.6 5.8v12.4L19 12 8.6 5.8Z" />,
  arrow: (
    <>
      <path d="M4 12h13" />
      <path d="M13 7l5 5-5 5" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4.6" width="18" height="14.8" rx="2" />
      <path d="M7.5 4.6v14.8M16.5 4.6v14.8M3 9.5h4.5M3 14.5h4.5M16.5 9.5H21M16.5 14.5H21" />
    </>
  ),
  crop: (
    <>
      <path d="M6 3v12a3 3 0 0 0 3 3h12" />
      <path d="M3 6h12a3 3 0 0 1 3 3v12" />
    </>
  ),
  text: <path d="M4 6.5h16M4 12h10M4 17.5h7" />,
  link: (
    <>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7l-1 1" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 1 0 5.7 5.7l1-1" />
    </>
  ),
  alert: (
    <>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    </>
  ),
  up: (
    <>
      <path d="M12 19V6" />
      <path d="M6 12l6-6 6 6" />
    </>
  ),
  /* 排序按钮原来写的是 ↑ / ↓ / ✕ 字符：字号不同基线会飘、粗细没法统一，
     而且 disabled:opacity-30 时箭头会糊成一团。给 up 配一个镜像的 down。 */
  down: (
    <>
      <path d="M12 5v13" />
      <path d="M6 12l6 6 6-6" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11.5a8 8 0 1 0-2.3 5.3" />
      <path d="M20 5.5v6h-6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" />,
  user: (
    <>
      <circle cx="12" cy="8.4" r="3.9" />
      <path d="M4.8 20.4a7.6 7.6 0 0 1 14.4 0" />
    </>
  ),

  /* ---- 内页工具用（tools/* 的 emoji 图标全部换成这批线性图标）----
     命名按「形状」而不是按「功能」：upload 用在所有上传入口，doc 用在所有 PDF 工具，
     这样新工具可以直接复用，PATHS 不会长成 100 个一次性图标。 */
  users: (
    <>
      <circle cx="9" cy="8.2" r="3.4" />
      <path d="M3 20a6.4 6.4 0 0 1 12 0" />
      <path d="M16.4 5.4a3.4 3.4 0 0 1 0 5.6M18 20a6 6 0 0 0-2.2-4.2" />
    </>
  ),
  tv: (
    <>
      <rect x="2.8" y="7" width="18.4" height="12.6" rx="2" />
      <path d="M8.4 3.8 12 7l3.6-3.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.4" y="5.2" width="17.2" height="15.4" rx="2" />
      <path d="M3.4 10h17.2M8.2 3.4v3.4M15.8 3.4v3.4" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0-3-3L5.2 17 4 20Z" />
      <path d="M14.6 7.4 17.6 10.4" />
    </>
  ),
  bulb: (
    <>
      <path d="M9.4 17.4h5.2M10.4 20.6h3.2" />
      <path d="M12 3.4a6 6 0 0 0-3.6 10.8c.6.5.9 1.1.9 1.8h5.4c0-.7.3-1.3.9-1.8A6 6 0 0 0 12 3.4Z" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.4h16v10.2H9.2L4.6 19.6V5.4Z" />
      <path d="M8 9.4h8M8 12h5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.4" width="18" height="13.2" rx="2" />
      <path d="M3.8 7 12 13 20.2 7" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.8" width="10" height="18.4" rx="2.4" />
      <path d="M10.8 5.6h2.4M11 18.4h2" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8l-4.5-4.5Z" />
      <path d="M13.8 3.6V8H18" />
      <path d="M8.6 13h6.8M8.6 16.4h4.4" />
    </>
  ),
  docs: (
    <>
      <rect x="4.4" y="7.4" width="12.2" height="13.2" rx="2" />
      <path d="M8.2 4.2h9a2 2 0 0 1 2 2v10.4" />
    </>
  ),
  sheet: (
    <>
      <rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2" />
      <path d="M3.6 9.6h16.8M3.6 14.4h16.8M9.6 4.6v14.8M14.6 4.6v14.8" />
    </>
  ),
  box: (
    <>
      <path d="M3.6 7.8h16.8v10.4a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2V7.8Z" />
      <path d="M3.6 7.8 6.2 3.8h11.6l2.6 4M12 3.8v4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M7.4 15.6v-3.2M11.4 15.6V8.6M15.4 15.6v-4.8" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9M4 12h5M4 17h11" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="18.6" cy="17" r="2.2" />
    </>
  ),
  lock: (
    <>
      <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2" />
      <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
    </>
  ),
  unlock: (
    <>
      <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2" />
      <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 6.9-1.3" />
    </>
  ),
  droplet: <path d="M12 3.4 6.8 9.6a6.6 6.6 0 1 0 10.4 0L12 3.4Z" />,
  ruler: (
    <>
      <rect x="2.4" y="8.4" width="19.2" height="7.2" rx="1.6" />
      <path d="M6.4 8.4v3M10.4 8.4v3M14.4 8.4v3M18.4 8.4v3" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M6.6 20h10.8" />
      <path d="M4 9.6h16" />
      <path d="M4 9.6 1.8 15a2.6 2.6 0 0 0 4.4 0L4 9.6ZM20 9.6l-2.2 5.4a2.6 2.6 0 0 0 4.4 0L20 9.6Z" />
    </>
  ),
  thermometer: (
    <>
      <path d="M10 13.8V5.6a2 2 0 1 1 4 0v8.2a4 4 0 1 1-4 0Z" />
      <path d="M12 16.4v-3.6" />
    </>
  ),
  flask: (
    <>
      <path d="M9.4 3.6h5.2" />
      <path d="M10.6 3.6v5.2L5.4 18.4a2 2 0 0 0 1.8 2h9.6a2 2 0 0 0 1.8-2l-5.2-9.6V3.6" />
      <path d="M7.6 14.6h8.8" />
    </>
  ),
  grid9: (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2" />
      <path d="M9.1 3.4v17.2M14.9 3.4v17.2M3.4 9.1h17.2M3.4 14.9h17.2" />
    </>
  ),
  camera: (
    <>
      <path d="M3.4 8.2h3.2l1.6-2.4h7.6l1.6 2.4h3.2v10.4a1.4 1.4 0 0 1-1.4 1.4H4.8a1.4 1.4 0 0 1-1.4-1.4V8.2Z" />
      <circle cx="12" cy="13.4" r="3.4" />
    </>
  ),
  mask: (
    <>
      <rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2" />
      <path d="M13.6 4.6 9 19.4" />
      <path d="M3.4 4.6 20.6 19.4" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.4a8.6 8.6 0 0 0 0 17.2c1.3 0 1.9-.8 1.9-1.7 0-1.6 1.1-2.1 2.4-2.1h1.3a3 3 0 0 0 3-3.1C20.6 6.9 16.7 3.4 12 3.4Z" />
      <circle cx="8" cy="10" r="1.1" />
      <circle cx="12" cy="7.6" r="1.1" />
      <circle cx="15.8" cy="10" r="1.1" />
    </>
  ),
  maskface: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M8.6 10.2h1.8M13.6 10.2h1.8M9 15a4.4 4.4 0 0 0 6 0" />
    </>
  ),
  upload: (
    <>
      <path d="M12 19V8" />
      <path d="M8 11.5 12 7.5l4 4" />
      <path d="M5 19.5h14" />
    </>
  ),
  swap: (
    <>
      <path d="M4 8.4h12.6M13.4 5.4l3 3-3 3" />
      <path d="M20 15.6H7.4M10.6 12.6l-3 3 3 3" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8.6V5.4A1.4 1.4 0 0 1 5.4 4h3.2M20 8.6V5.4A1.4 1.4 0 0 0 18.6 4h-3.2M4 15.4v3.2A1.4 1.4 0 0 0 5.4 20h3.2M20 15.4v3.2a1.4 1.4 0 0 1-1.4 1.4h-3.2" />
      <path d="M4 12h16" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.4c2.4 2.6 2.4 14.6 0 17.2-2.4-2.6-2.4-14.6 0-17.2Z" />
    </>
  ),
  idcard: (
    <>
      <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2" />
      <circle cx="8.6" cy="11.4" r="2.1" />
      <path d="M5.4 16.4a3.4 3.4 0 0 1 6.4 0M13.6 10.4h4.4M13.6 13.6h3" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6.4" cy="17.6" r="2.6" />
      <circle cx="6.4" cy="6.4" r="2.6" />
      <path d="M8.6 8.2 19.6 18.6M19.6 5.4 8.6 15.8" />
    </>
  ),
  filmstrip: (
    <>
      <rect x="2.8" y="6.2" width="18.4" height="11.6" rx="1.8" />
      <path d="M7 6.2v11.6M17 6.2v11.6M2.8 12h18.4" />
    </>
  ),
  check: <path d="M4.6 12.6 9.4 17.4 19.4 6.6" />,
  /* 删除/关闭：这几个 tools 里原来直接写 ✕ 字符，
     字号不同基线会飘，也没有描边粗细控制，换成统一线性图标。 */
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  /* 播放器全屏按钮：进/出两个状态要形状相近，否则切换时像换了个控件。 */
  expand: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />,
  compress: <path d="M9 4v3a2 2 0 0 1-2 2H4m16 0h-3a2 2 0 0 0-2 2v3m0-10V3m0 18v-3a2 2 0 0 0-2-2H4" />,
  timer: (
    <>
      <circle cx="12" cy="13.4" r="7.6" />
      <path d="M12 9.8v3.6l2.4 1.8M9.6 2.8h4.8" />
    </>
  ),
};

export const ICON_NAMES = Object.keys(PATHS);

export default function Icon({ name, className = '', title }) {
  const shape = PATHS[name];
  if (!shape) return null;
  return (
    <svg
      className={`ic ${className}`}
      viewBox="0 0 24 24"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {shape}
    </svg>
  );
}
