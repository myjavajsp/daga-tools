import React, { useMemo, useSyncExternalStore } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import { createAppTheme } from './theme';
import { isDarkMode, subscribe } from './lib/themeMode';
import './index.css';

/**
 * Root — MUI 只认 JS 里的 palette，不会跟着 CSS 变量走，
 * 所以把 .dark 状态接进 ThemeProvider，两套材质一起翻。
 *
 * 注意：这里刻意不挂 <CssBaseline />。它会往 head 末尾追加一条
 * `body { background-color: <写死的色值>; color: <写死的色值> }`，
 * 优先级压过 src/index.css 里 `background: var(--paper); color: var(--ink)`，
 * 于是切到深色时整站文字仍是 #0e1116 压 #0e1116（实测对比度 1.08:1）。
 * body 的底色、文字、字体、行高在 index.css 的 @layer base 里已经全部定义好了。
 */
function Root() {
  const dark = useSyncExternalStore(subscribe, isDarkMode, isDarkMode);
  const theme = useMemo(() => createAppTheme(dark), [dark]);
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
