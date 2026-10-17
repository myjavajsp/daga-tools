import { createTheme } from '@mui/material/styles';

/**
 * MUI 主题 — 与 src/index.css 的设计 token 对齐（明亮清爽 v5）。
 *
 * 前台仍有不少 MUI 组件（PlayerArea、各类 tools 页），它们不吃 Tailwind，
 * 所以这里必须跟着换色，否则同一页会出现两套材质。
 * 深色只在 .dark 时启用：Header 已经把 .dark 挂到 <html> 上了。
 */

const COBALT = '#1c47d6';   /* --accent */
const COBALT_DARKMODE = '#7c96ef'; /* 压深底的强调色，实测 6.72:1 */

const light = {
  palette: {
    mode: 'light',
    primary: { main: COBALT, light: '#8fa6f2', dark: '#1638ac', contrastText: '#ffffff' },
    secondary: { main: '#535a63', light: '#9aa1aa', dark: '#3a4149', contrastText: '#ffffff' },
    error: { main: '#b62d23' },
    warning: { main: '#8a5a12' },
    success: { main: '#1f6a4a' },
    background: { default: '#f7f8f9', paper: '#ffffff' },
    text: { primary: '#0e1116', secondary: '#535a63' },
    divider: '#e2e5e9',
  },
};

const dark = {
  palette: {
    mode: 'dark',
    primary: { main: COBALT_DARKMODE, light: '#a2b6f6', dark: '#2b56e0', contrastText: '#0e1116' },
    secondary: { main: '#b6bec9', light: '#d3d9e0', dark: '#8d97a3', contrastText: '#0e1116' },
    error: { main: '#ef8078' },
    warning: { main: '#e0b070' },
    success: { main: '#6ec59f' },
    background: { default: '#0e1116', paper: '#151a21' },
    text: { primary: '#f1f3f6', secondary: '#b6bec9' },
    divider: '#242c35',
  },
};

const shared = {
  typography: {
    fontFamily: [
      '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"',
      'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif',
    ].join(','),
    h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.4, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.45, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.5 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.6 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 9, boxShadow: 'none' },
        // 去掉「AI 味」的彩色光晕 hover，只留纯色压深
        containedPrimary: { '&:hover': { boxShadow: 'none' } },
        containedSecondary: { '&:hover': { boxShadow: 'none' } },
      },
    },
    // 描边走 token：写死 #e2e5e9 的话深色模式里卡片会带一圈亮边
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: 'none', border: '1px solid var(--line)' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 9 } } } },
    MuiSelect: { styleOverrides: { root: { borderRadius: 9 }, outlined: { borderRadius: 9 } } },
    MuiAccordion: { styleOverrides: { root: { borderRadius: '12px !important', '&:before': { display: 'none' } } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
  },
};

/**
 * createAppTheme — 按当前 .dark 状态出主题。
 * MUI 只吃 JS 值，CSS 变量变化不会让它重算，所以调用方（ThemeProvider）
 * 需要在切换深色时重新渲染，见 main.jsx 的 useDarkMode。
 */
export function createAppTheme(isDark) {
  return createTheme({ ...shared, ...(isDark ? dark : light) });
}

const theme = createTheme({ ...shared, ...light });
export default theme;
