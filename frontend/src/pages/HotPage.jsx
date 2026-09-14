import { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">热搜榜</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3">实时热门影视内容</p>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, idx) => (
              <div
                key={video.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="relative aspect-video bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-5xl">🎬</span>
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-white text-xs">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>👁️ {video.views}</span>
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs">
                      热门
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">🔥</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">128万</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">今日热度</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">👥</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">45.2万</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">今日活跃用户</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">📺</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">8,520</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">热门影视数</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
