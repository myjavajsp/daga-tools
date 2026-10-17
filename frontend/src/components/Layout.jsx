import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout — 前台通用布局（Header + 内容 + Footer）
 * 容器宽度与左右留白交给 .wrap（1140px + safe-area），不再用 MUI Container。
 */
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Header />
      <main className="flex-1 py-5 md:py-6">
        <div className="wrap">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
