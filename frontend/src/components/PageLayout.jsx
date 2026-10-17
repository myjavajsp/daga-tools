import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * PageLayout — 前台通用布局（自带 .dark 支持：token 由 <html> 上的 .dark 切换）
 * 目前与 Layout 同构，保留是为了给页面级 title/SEO 钩子留位。
 */
export default function PageLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
