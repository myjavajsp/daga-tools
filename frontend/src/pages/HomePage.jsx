import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import BackToTop from '../components/BackToTop';
import HeroSection from '../components/home/HeroSection';
import PlayerArea from '../components/home/PlayerArea';
import ParseForm from '../components/home/ParseForm';
import ToolGrid from '../components/home/ToolGrid';
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
  fetchArticles,
} from '../api/public';

/** 兜底线路：后端暂无数据时，保证首页解析按钮不会永久禁用 */
const FALLBACK_INTERFACES = [
  { id: 0, name: '默认线路', url: 'https://im1907.top/?jx=', type: 'video', sort_order: 0 },
];

/** 固定文案（版式来自 demo，法律口径沿用线上原文） */
const LEGAL_NOTICE =
  '本站只做在线解析播放，不存储、不提供下载任何片源。所有解析内容版权归原平台所有，请用于学习与交流，观看后 24 小时内删除，勿作商业用途。';

const GUIDE_INTRO =
  '整个过程通常不超过十秒。真正会卡住的只有一件事：粘进来的地址不是播放页，而是搜索结果页或短视频分享页。';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interfaces, setInterfaces] = useState([]);
  const [settings, setSettings] = useState({});
  const [steps, setSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [links, setLinks] = useState([]);
  const [articles, setArticles] = useState([]);
  const [ads, setAds] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentInterface, setCurrentInterface] = useState(null);

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
        fetchArticles(4),
      ]);

      const [interfacesRes, settingsRes, guideRes, faqRes, linksRes, adsRes, articlesRes] = results;

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
      if (articlesRes.status === 'fulfilled' && articlesRes.value.success) {
        setArticles(articlesRes.value.data?.list || []);
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

  /**
   * 首页 Hero 可用的线路：后端 /api/public/interfaces 返回的是「全部启用线路」，
   * 其中混有 type='short' 的短视频去水印接口，这里只保留长视频 VIP 解析线路。
   * 若后端暂无数据，用兜底线路兜住，避免按钮被永久禁用。
   */
  const heroInterfaces = useMemo(() => {
    const list = Array.isArray(interfaces)
      ? interfaces.filter((i) => (i.type || 'video') === 'video')
      : [];
    return list.length ? list : FALLBACK_INTERFACES;
  }, [interfaces]);

  /** 推荐位：有文章用文章（真标题/摘要/封面/站内详情），没有就用后台友情链接 */
  const recItems = useMemo(() => {
    if (articles.length > 0) {
      return articles.map((a) => ({
        key: a.id,
        title: a.title,
        desc: a.excerpt || '',
        meta: [a.category, (a.published_at || '').slice(0, 10)].filter(Boolean),
        cover: a.cover_image || '',
        to: `/article/${a.slug}`,
      }));
    }
    return links;
  }, [articles, links]);

  // 公告条：后台开启且内容非空时展示
  const showAnnouncement = settings.announcement_enabled === '1' && !!settings.announcement;

  const handleParse = useCallback((url, iface) => {
    setVideoUrl(url);
    setCurrentInterface(iface);
    // 播放器就在首屏右栏时不必滚动；手机端它在表单下方，才把它滚进视野
    const el = document.getElementById('parse-player');
    if (!el || !el.scrollIntoView) return;
    const b = el.getBoundingClientRect();
    const fullyVisible = b.top >= 0 && b.bottom <= window.innerHeight;
    if (!fullyVisible) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Header />

      <main className="flex-1">
        <HeroSection
          title={
            <>
              把播放页链接粘进来，
              <br />
              直接看好剧<em>。</em>
            </>
          }
          lead="免费解析腾讯、优酷、爱奇艺、芒果 TV 的会员视频。不用注册、不用装客户端，卡在某一线路时换下一条即可。"
        >
          <ParseForm interfaces={heroInterfaces} onParse={handleParse} />
        </HeroSection>

        {/* 播放器区：放在解析框下面，整宽显示 */}
        <section className="section" style={{ paddingTop: 'var(--s3)', paddingBottom: 'var(--s3)' }}>
          <div className="wrap">
            <div id="parse-player" className="card overflow-hidden">
              <PlayerArea videoUrl={videoUrl} currentInterface={currentInterface} />
            </div>
          </div>
        </section>

        <div className="wrap notice-row">
          {showAnnouncement && <NoticeBanner title="公告：" message={settings.announcement} />}
          <NoticeBanner title="先说清楚：" message={LEGAL_NOTICE} />
        </div>

        {loading ? (
          <div className="wrap">
            <Loading message="正在加载数据…" />
          </div>
        ) : error ? (
          <div className="wrap">
            <ErrorMessage message={error} onRetry={loadData} />
          </div>
        ) : (
          <>
            <ToolGrid />
            <RecommendLinks items={recItems} />
            <GuideSteps steps={steps} intro={GUIDE_INTRO} />
            <FaqSection faqs={faqs} />
          </>
        )}

        {/* 广告区：阿里云单独一行，其他广告在另一行 */}
        {ads.length > 0 && (
          <section className="section">
            <div className="wrap">
              {/* 阿里云广告单独一行 */}
              {ads.filter(a => a.name && a.name.includes('阿里云')).map((ad) => (
                <div key={ad.id} style={{ marginBottom: 'var(--s2)' }}>
                  <AdBanner ads={[ad]} />
                </div>
              ))}
              {/* 其他广告一行 */}
              {ads.filter(a => !a.name || !a.name.includes('阿里云')).length > 0 && (
                <AdBanner ads={ads.filter(a => !a.name || !a.name.includes('阿里云'))} row />
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
