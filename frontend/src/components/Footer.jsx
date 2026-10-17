import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

const COLS = [
  {
    title: '功能',
    links: [
      { label: '视频解析', to: '/' },
      { label: '影视推荐', to: '/recommend' },
      { label: '实用工具', to: '/tools/' },
      { label: 'AI 工具', to: '/ai' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '关于我们', to: '/about' },
      { label: '表情包', to: '/meme' },
      { label: '隐私政策', to: '/privacy-policy' },
      { label: '服务条款', to: '/terms' },
      { label: '联系我们', to: '/contact' },
    ],
  },
];

/**
 * Footer — 页脚（明亮清爽 v5）
 * 三列：品牌+一句话说明 / 功能 / 关于，最后一行是版权与 SEO 关键词。
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot">
          <div>
            <Link to="/" className="brand">
              <BrandMark />
              <span>全民影视VIP解析</span>
            </Link>
            <p className="fdesc">一个只做解析和在线小工具的站。不存片源、不要注册、不装任何客户端。</p>
          </div>
          {COLS.map((col) => (
            <div className="fcol" key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="copy">
          <span>© 2026 全民影视VIP解析 · 仅供学习交流，请勿用于商业用途</span>
          <span>视频解析 · 表情包 · 制图 · 实用工具</span>
        </div>
      </div>
    </footer>
  );
}
