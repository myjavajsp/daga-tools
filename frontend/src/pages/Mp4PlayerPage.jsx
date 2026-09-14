import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Mp4PlayerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">MP4 在线播放</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3">支持 MP4 格式视频在线播放</p>
        </div>

        {/* Player Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-500 dark:text-gray-400">MP4 播放器</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">支持的格式</h3>
          <div className="flex flex-wrap gap-2">
            {['MP4', 'H.264', 'H.265', 'WebM', 'AVI'].map((format) => (
              <span key={format} className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium">
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
