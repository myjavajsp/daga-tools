import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * PageLayout - 前台通用布局（包含深色模式支持）
 */
export default function PageLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
