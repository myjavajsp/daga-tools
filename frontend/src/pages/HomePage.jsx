import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import HeroSection from '../components/home/HeroSection';
import PlayerArea from '../components/home/PlayerArea';
import ParseForm from '../components/home/ParseForm';
import RecommendLinks from '../components/home/RecommendLinks';
import GuideSteps from '../components/home/GuideSteps';
import FaqSection from '../components/home/FaqSection';
import AdBanner from '../components/home/AdBanner';
import NoticeBanner from '../components/home/NoticeBanner';
import {
  fetchInterfaces,
  fetchSettings,
  fetchGuide,
  fetchFaq,
  fetchLinks,
  fetchAds,
} from '../api/public';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interfaces, setInterfaces] = useState([]);
  const [settings, setSettings] = useState({});
  const [steps, setSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [links, setLinks] = useState([]);
  const [ads, setAds] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentInterface, setCurrentInterface] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetchInterfaces(),
        fetchSettings(),
        fetchGuide(),
        fetchFaq(),
        fetchLinks(),
        fetchAds(),
      ]);

      const [interfacesRes, settingsRes, guideRes, faqRes, linksRes, adsRes] = results;

      if (interfacesRes.status === 'fulfilled' && interfacesRes.value.success) {
        setInterfaces(interfacesRes.value.data || []);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.success) {
        setSettings(settingsRes.value.data || {});
      }
      if (guideRes.status === 'fulfilled' && guideRes.value.success) {
        setSteps(guideRes.value.data || []);
      }
      if (faqRes.status === 'fulfilled' && faqRes.value.success) {
        setFaqs(faqRes.value.data || []);
      }
      if (linksRes.status === 'fulfilled' && linksRes.value.success) {
        setLinks(linksRes.value.data || []);
      }
      if (adsRes.status === 'fulfilled' && adsRes.value.success) {
        setAds(adsRes.value.data || []);
      }

      const allFailed = results.every((r) => r.status === 'rejected');
      if (allFailed) {
        setError('数据加载失败，请检查网络连接后重试');
      }
    } catch (err) {
      console.error('[HomePage] loadData error:', err);
      setError('数据加载失败：' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleParse = useCallback((url, iface) => {
    setVideoUrl(url);
    setCurrentInterface(iface);
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-50 h-14 md:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-14 md:h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center cursor-pointer mr-4 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span className="hidden sm:block ml-2.5 text-base font-bold text-gray-900 dark:text-white">
                  全民影视VIP解析
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { label: '视频解析', path: '/', icon: '🔍' },
                  { label: '实用工具', path: '/tools/', icon: '🛠️' },
                  { label: '热搜', path: '/hot', icon: '🔥' },
                  { label: '音乐', path: '/music', icon: '🎵' },
                  { label: 'AI 工具', path: '/ai', icon: '🤖' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative px-3.5 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="切换主题"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  EN
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl mb-5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700">
              <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>
              <div className="relative z-10 px-6 py-10 md:py-14">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    免费在线解析 · 无需安装
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                    蓝光VIP视频在线解析
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1">
                      高清流畅 极速播放
                    </span>
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    免费解析腾讯视频、优酷、爱奇艺等全网VIP视频
                  </p>
                </div>

                {/* Parse Form */}
                <div className="max-w-2xl mx-auto">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                      <div className="flex items-center p-1.5">
                        <div className="flex-1 flex items-center px-3 py-1">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                          </svg>
                          <input
                            type="text"
                            placeholder="粘贴视频链接（支持腾讯/优酷/爱奇艺等）"
                            className="flex-1 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 text-sm md:text-base focus:outline-none"
                          />
                        </div>
                        <select className="px-3 py-2 mx-1 text-sm rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer min-w-[120px]">
                          <option value="1">搜影片名称专用</option>
                          <option value="3">备用解析2</option>
                          <option value="7">备用解析4</option>
                          <option value="8">备用解析5</option>
                          <option value="11">极速云解析</option>
                          <option value="13">七七解析</option>
                          <option value="14">咸鱼解析</option>
                        </select>
                        <button
                          type="submit"
                          className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 flex-shrink-0"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          </svg>
                          <span className="hidden sm:inline">解析播放</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400 dark:text-gray-500">
                      <span>试试：</span>
                      <button type="button" className="px-2.5 py-1 rounded-full bg-white/60 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all truncate max-w-[160px]">
                        www.iqiyi.com
                      </button>
                      <button type="button" className="px-2.5 py-1 rounded-full bg-white/60 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all truncate max-w-[160px]">
                        v.qq.com
                      </button>
                      <button type="button" className="px-2.5 py-1 rounded-full bg-white/60 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all truncate max-w-[160px]">
                        www.youku.com
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Notice Banner */}
            <div className="mb-5">
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">重要公告</div>
                  <p className="text-sm leading-relaxed text-red-600 dark:text-red-300">
                    本工具仅用于学习交流，请勿用于商业用途。所有解析内容版权归原平台所有，请在24小时内删除观看内容。
                  </p>
                </div>
              </div>
            </div>

            {/* Player Area */}
            <div className="mb-5 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900">
              <PlayerArea videoUrl={videoUrl} currentInterface={currentInterface} />
            </div>

            {/* Quick Links */}
            <div className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-5">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
                {[
                  { icon: '🎬', label: 'M3U8播放器', desc: '在线播放', path: '/tools/m3u8-player', color: 'from-red-500 to-rose-500' },
                  { icon: '⬇️', label: '短视频去水印', desc: '抖音/快手', path: '/tools/video-downloader', color: 'from-amber-500 to-orange-500' },
                  { icon: '📱', label: '二维码生成', desc: '免费生成', path: '/tools/qr-code-gen', color: 'from-emerald-500 to-teal-500' },
                  { icon: '📄', label: 'PDF合并', desc: '在线处理', path: '/tools/pdf-merge', color: 'from-blue-500 to-indigo-500' },
                  { icon: '🖼️', label: 'AI去背景', desc: '一键抠图', path: '/tools/image-bg-remove', color: 'from-violet-500 to-purple-500' },
                  { icon: '🎞️', label: '视频转GIF', desc: 'MP4转GIF', path: '/tools/video-to-gif', color: 'from-pink-500 to-rose-500' },
                  { icon: '🎵', label: '音乐搜索', desc: 'QQ曲库', path: '/music', color: 'from-cyan-500 to-blue-500' },
                  { icon: '🔥', label: '热搜榜', desc: '实时热点', path: '/hot', color: 'from-orange-500 to-red-500' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center gap-2 py-3 px-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group -m-1 p-1"
                  >
                    <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200 text-xl`}>
                      {item.icon}
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium text-center leading-tight">{item.label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden md:block">{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            {loading ? (
              <Loading message="正在加载数据…" />
            ) : error ? (
              <ErrorMessage message={error} onRetry={loadData} />
            ) : (
              <>
                {/* Recommend Section */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">最新推荐</h3>
                    </div>
                    <Link to="/recommend" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors">
                      查看全部 →
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 ml-3">热门影视资讯精选</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {links.slice(0, 2).map((link) => (
                      <Link
                        key={link.id}
                        to={`/recommend/${link.slug}`}
                        className="group flex items-stretch bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
                      >
                        <div className="w-20 md:w-28 flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                          <span className="text-white/30 text-2xl md:text-4xl font-black">荐</span>
                        </div>
                        <div className="flex-1 p-3 md:p-3.5 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-medium">
                              {link.category || '推荐'}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{link.created_at || '2026/9/12'}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {link.title}
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-1">
                            {link.excerpt || '点击查看详细内容...'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Guide Steps */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">使用说明</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="relative p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/60 dark:border-blue-500/10 text-center"
                      >
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg mb-3 shadow-md shadow-blue-500/20">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {step.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">常见问题</h3>
                  </div>
                  <div className="space-y-2">
                    {faqs.slice(0, 5).map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 bg-gray-50 dark:bg-gray-700/50"
                      >
                        <details className="group">
                          <summary className="flex items-center justify-between px-4 py-3.5 text-left font-semibold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer list-none">
                            <span className="pr-3">{faq.question}</span>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 bg-gray-200 dark:bg-gray-600 text-gray-500 group-open:rotate-180">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                          </summary>
                          <div className="px-4 pb-4 pt-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ads */}
                {ads.map((ad, idx) => (
                  <div key={idx} className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <AdBanner ads={[ad]} />
                  </div>
                ))}
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-8 md:py-10 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="ml-2 font-bold text-gray-900 dark:text-white">全民影视VIP解析</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left max-w-xs">
                  免费在线视频解析工具站，支持多平台高清播放
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="flex justify-center gap-x-4 gap-y-1 flex-wrap">
                  <Link to="/recommend" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">影视推荐</Link>
                  <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">视频解析</Link>
                  <Link to="/meme" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">表情包</Link>
                  <Link to="/tools/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">实用工具</Link>
                  <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">关于我们</Link>
                </div>
                <div className="flex justify-center gap-x-4 gap-y-1 flex-wrap">
                  <Link to="/privacy-policy" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">隐私政策</Link>
                  <Link to="/terms" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">服务条款</Link>
                  <Link to="/contact" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">联系我们</Link>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-1">视频解析, 表情包, 制图, 实用工具, 在线工具</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">© 2026 全民影视VIP解析. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-xl transition-all duration-300"
          aria-label="返回顶部"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
