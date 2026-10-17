/**
 * themeMode — 深浅色的唯一状态源。
 *
 * 之前每个 Header 实例自己 useState，Tailwind 的 .dark 开关又因为
 * darkMode 没配 'class' 而完全不生效（只跟系统走）。这里收敛成一个
 * 外部 store：Tailwind（.dark 类 → index.css 的 token 覆盖）和
 * MUI（main.jsx 里 useSyncExternalStore → createAppTheme）读同一份状态，
 * 换肤时两套材质一起翻，不会出现半深半浅的页面。
 *
 * localStorage['darkMode'] 存 JSON 布尔，沿用旧 key，
 * 老用户的偏好不会因为这次改版丢失。
 */
const STORAGE_KEY = 'darkMode';
const MQ = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : null;

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) === true;
  } catch {
    return null;
  }
}

function systemDark() {
  return !!(MQ && MQ.matches);
}

let value = readStored() ?? systemDark();
const listeners = new Set();

function apply(next) {
  value = next;
  const el = document.documentElement;
  el.classList.toggle('dark', next);
}
apply(value);

/* 用户没手动选过时，跟随系统；选过之后就以选择为准 */
if (MQ) {
  const onChange = () => {
    if (readStored() !== null) return;
    apply(systemDark());
    listeners.forEach((l) => l());
  };
  if (MQ.addEventListener) MQ.addEventListener('change', onChange);
  else if (MQ.addListener) MQ.addListener(onChange);
}

export function isDarkMode() {
  return value;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setDarkMode(next) {
  const on = !!next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(on));
  } catch {
    /* 隐私模式写不进去：本次会话内仍然有效 */
  }
  if (on === value) return;
  apply(on);
  listeners.forEach((l) => l());
}

export function toggleDarkMode() {
  setDarkMode(!value);
}
