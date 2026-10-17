/**
 * Tailwind 配置 — 与 ui-redesign-demo 的「明亮清爽 v5」同一套材质。
 *
 * 两套色阶是这次换肤的关键：
 *  - gray：冷调中性灰阶（纸白 → 墨黑），替换 Tailwind 默认暖灰，
 *          整站 2700+ 处 gray-* 工具类一次性跟着变冷，不用逐页改。
 *  - blue / brand：钴蓝单强调色（#1c47d6）。blue-* 用得很广（545 处），
 *          brand-* 是 Header 早就在用但配置里从来没定义的调色板
 *          （text-brand-600 之类此前不产出任何样式），这里补上。
 *
 * darkMode 用 class：Header 已经在切换 documentElement 上的 .dark，
 * 默认 'media' 会让那个开关完全失效（只跟系统走）。改成 class 后开关才真正有用，
 * 深色取值见 src/index.css 的 .dark token 覆盖。
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* 语义 token：新代码优先用这四个，别再去捞灰阶 */
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',   /* 悬停底：次级按钮 hover 用，见 index.css */
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',

        /* 强调色与语义色一律走 token：同一套类名在 .dark 下自动换值，
           不要再写 dark:bg-gray-800 这种第二套材质（那是旧深色页的写法）。
           注意：var() 颜色不吃 /10 这种透明度修饰符，需要浅底就用 *-soft。 */
        accent: 'var(--accent)',
        'accent-press': 'var(--accent-press)',
        'accent-soft': 'var(--accent-soft)',
        'accent-fg': 'var(--accent-fg)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        'danger-press': 'var(--danger-press)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        'success-press': 'var(--success-press)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        'warning-press': 'var(--warning-press)',

        gray: {
          50: '#f7f8f9',
          100: '#eef0f2',
          200: '#e2e5e9',
          300: '#cdd2d8',
          400: '#9aa1aa',
          500: '#656c75',
          600: '#535a63',
          700: '#3a4149',
          800: '#1a1f27',
          900: '#0e1116',
          950: '#080a0e',
        },
        blue: {
          50: '#eaeefc',
          100: '#d7e0fb',
          200: '#b9c8f8',
          300: '#8fa6f2',
          400: '#7c96ef',
          500: '#2b56e0',
          600: '#1c47d6',
          700: '#1638ac',
          800: '#122c86',
          900: '#0e2160',
          950: '#0a1840',
        },
        brand: {
          50: '#eaeefc',
          100: '#d7e0fb',
          200: '#b9c8f8',
          300: '#8fa6f2',
          400: '#7c96ef',
          500: '#2b56e0',
          600: '#1c47d6',
          700: '#1638ac',
          800: '#122c86',
          900: '#0e2160',
          950: '#0a1840',
        },
      },
      borderRadius: { card: '12px', sm: '9px' },
      boxShadow: {
        card: '0 1px 2px rgba(14,17,22,.05), 0 6px 16px -10px rgba(14,17,22,.10)',
        lift: '0 2px 4px rgba(14,17,22,.06), 0 14px 28px -12px rgba(14,17,22,.16)',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: { content: '1140px' },
    },
  },
  plugins: [],
};
