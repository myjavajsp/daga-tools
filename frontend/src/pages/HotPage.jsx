import { useState, useEffect } from 'react';
import Icon from '../components/Icons';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HotPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const mockVideos = [
        { id: 1, title: '如何使用视频解析工具', views: '12.5万', duration: '5:32' },
        { id: 2, title: '十大必备在线工具推荐', views: '8.3万', duration: '8:15' },
        { id: 3, title: 'M3U8视频下载教程', views: '6.7万', duration: '3:45' },
        { id: 4, title: '视频格式转换完全指南', views: '5.2万', duration: '12:08' },
      ];
      setVideos(mockVideos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      
      <main className="wrap py-8">
        {/* Page Title */}
        <div className="phead">
          <h1>热搜榜</h1>
          <span className="note">实时热门影视内容</span>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, idx) => (
              <div
                key={video.id}
                className="card overflow-hidden hover:shadow-lift hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="relative aspect-video bg-surface-2 flex items-center justify-center">
                  <Icon name="filmstrip" className="text-ink-3" />
                  {/* 压在画面上的角标：底色是黑遮罩，文字走 .on-media 固定浅色，
                      text-white 这种写死的白不在色板里，深色档会和材质脱节。 */}
                  <div className="on-media absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="on-media absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-ink mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-ink-3">
                    <span className="inline-flex items-center gap-1.5"><Icon name="eye" />{video.views}</span>
                    <span className="badge warn">热门</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-card p-5 border border-line">
            <div className="flex items-center gap-3">
              <span className="chip"><Icon name="flame" /></span>
              <div>
                <div className="text-2xl font-bold text-ink">128万</div>
                <div className="text-xs text-ink-3">今日热度</div>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-card p-5 border border-line">
            <div className="flex items-center gap-3">
              <span className="chip"><Icon name="users" /></span>
              <div>
                <div className="text-2xl font-bold text-ink">45.2万</div>
                <div className="text-xs text-ink-3">今日活跃用户</div>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-card p-5 border border-line">
            <div className="flex items-center gap-3">
              <span className="chip"><Icon name="tv" /></span>
              <div>
                <div className="text-2xl font-bold text-ink">8,520</div>
                <div className="text-xs text-ink-3">热门影视数</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
