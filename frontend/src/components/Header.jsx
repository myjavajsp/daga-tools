import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchSettings } from '../api/public';
import BrandMark from './BrandMark';
import Icon from './Icons';
import { isDarkMode, subscribe, toggleDarkMode } from '../lib/themeMode';

/** 导航项 → toggles 开关 key 映射（无 toggle 字段的项永显） */
const NAV_TOGGLE_KEY = {
  ai: 'enable_ai',
};

const NAV_ITEMS = [
  { label: '视频解析', path: '/' },
  { label: '影视推荐', path: '/recommend' },
  { label: '实用工具', path: '/tools/' },
  { label: 'AI 工具', path: '/ai', toggle: 'ai' },
];

/**
 * 解析 toggles 设置（JSON 字符串），失败/缺失返回 null（调用方按全显示处理）。
 * 向后兼容：旧库无 toggles 键或值非法时不影响导航。
 */
function parseToggles(raw) {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : null;
  } catch {
    return null;
  }
}

/** 按 toggles 过滤导航；toggles 为 null 时全量返回 */
function filterNavByToggles(items, toggles) {
  if (!toggles) return items;
  return items.filter((item) => {
    const key = item.toggle && NAV_TOGGLE_KEY[item.toggle];
    if (!key) return true;
    return String(toggles[key] ?? '1') !== '0';
  });
}

/**
 * Header — 全站导航（明亮清爽 v5）
 *
 * 材质直接复用卡片那一套：底=--surface、下沿=1px --line、滚动后浮起 --sh。
 * 手机端不再用抽屉：导航变成品牌下方一条横向滚动菜单（demo 的做法），
 * 搜索/主题/账号留在顶栏，320px 也能容下。
 */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dark = useSyncExternalStore(subscribe, isDarkMode, isDarkMode);
  // 公共设置（toggles 开关组）：缺失/失败时导航全显示
  const [navItems, setNavItems] = useState(NAV_ITEMS);
  const [scrolled, setScrolled] = useState(false);
  // 用户登录态（令牌存 localStorage['daga_user_token']，与后台 daga_token 隔离）
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('daga_user') || 'null');
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('daga_user_token');
    localStorage.removeItem('daga_user');
    setUser(null);
  };

  /* 浮起态：滚过 8px 才挂阴影，静止在顶部时零厚度 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 拉取公共设置，按 toggles 过滤导航（失败时保持全显示）
  useEffect(() => {
    let alive = true;
    fetchSettings()
      .then((res) => {
        if (!alive || !res || !res.success) return;
        const toggles = parseToggles(res.data && res.data.toggles);
        if (toggles) setNavItems(filterNavByToggles(NAV_ITEMS, toggles));
      })
      .catch(() => { /* 兼容：拿不到设置就全显示 */ });
    return () => { alive = false; };
  }, []);

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header className={`site-header${scrolled ? ' up' : ''}`}>
      <div className="wrap nav">
        <Link to="/" className="brand">
          <BrandMark />
          <span>全民影视VIP解析</span>
        </Link>

        <nav className="menu" aria-label="主导航">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={isActive(item.path) ? 'on' : undefined} aria-current={isActive(item.path) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 登录态/操作区：手机端也在顶栏，导航另起一行横向滚动 */}
        <div className="hact">
          <button className="icon-btn" onClick={() => navigate('/search')} aria-label="搜索影片">
            <Icon name="search" />
          </button>
          <button className="icon-btn" onClick={toggleDarkMode} aria-label={dark ? '切换到浅色' : '切换到深色'}>
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>
        </div>
      </div>
    </header>
  );
}
