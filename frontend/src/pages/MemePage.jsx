import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MemePage() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeme, setSelectedMeme] = useState(null);

  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = async () => {
    try {
      const mockMemes = [
        { id: 1, name: '滑稽', emoji: '😏' },
        { id: 2, name: '捂脸', emoji: '🤦' },
        { id: 3, name: '菜刀', emoji: '🔪' },
        { id: 4, name: '抠鼻', emoji: '👃' },
        { id: 5, name: '吃惊', emoji: '😲' },
        { id: 6, name: '害羞', emoji: '😳' },
        { id: 7, name: '微笑', emoji: '🙂' },
        { id: 8, name: '大笑', emoji: '😆' },
        { id: 9, name: '难过', emoji: '😢' },
        { id: 10, name: '生气', emoji: '😠' },
        { id: 11, name: '期待', emoji: '🥺' },
        { id: 12, name: '得意', emoji: '😎' },
      ];
      setMemes(mockMemes);
    } catch (error) {
      console.error('Failed to load memes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">表情包大全</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3">精选热门表情，一键下载使用</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Meme Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
              {memes.map(meme => (
                <div
                  key={meme.id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                  onClick={() => setSelectedMeme(meme)}
                >
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 flex items-center justify-center">
                    <span className="text-4xl">{meme.emoji}</span>
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm truncate">{meme.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">1000+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">热门表情</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">50+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">分类标签</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">免费</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">无广告</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">秒传</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">快速下载</div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Modal */}
      {selectedMeme && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-8xl">{selectedMeme.emoji}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{selectedMeme.name}</h2>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                下载
              </button>
              <button
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                onClick={() => setSelectedMeme(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
