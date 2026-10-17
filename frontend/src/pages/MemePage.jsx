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
    <div className="min-h-screen bg-paper">
      <Header />
      
      <main className="wrap py-8">
        {/* Page Header */}
        <div className="phead">
          <h1>表情包大全</h1>
          <span className="note">精选热门表情，一键下载使用</span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin spin"></div>
          </div>
        ) : (
          <>
            {/* Meme Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
              {memes.map(meme => (
                <div
                  key={meme.id}
                  className="bg-surface rounded-card overflow-hidden cursor-pointer hover:shadow-lift hover:-translate-y-1 transition-all duration-200 border border-line"
                  onClick={() => setSelectedMeme(meme)}
                >
                  <div className="aspect-square bg-surface-2 flex items-center justify-center">
                    <span className="text-4xl">{meme.emoji}</span>
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-ink-2 font-medium text-sm truncate">{meme.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface rounded-card p-4 border border-line text-center">
                <div className="text-2xl font-bold text-warning">1000+</div>
                <div className="text-xs text-ink-3 mt-1">热门表情</div>
              </div>
              <div className="bg-surface rounded-card p-4 border border-line text-center">
                <div className="text-2xl font-bold text-warning">50+</div>
                <div className="text-xs text-ink-3 mt-1">分类标签</div>
              </div>
              <div className="bg-surface rounded-card p-4 border border-line text-center">
                <div className="text-2xl font-bold text-success">免费</div>
                <div className="text-xs text-ink-3 mt-1">无广告</div>
              </div>
              <div className="bg-surface rounded-card p-4 border border-line text-center">
                <div className="text-2xl font-bold text-accent">秒传</div>
                <div className="text-xs text-ink-3 mt-1">快速下载</div>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Modal */}
      {selectedMeme && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-lift">
            <div className="aspect-square bg-surface-2 rounded-card flex items-center justify-center mb-4">
              <span className="text-8xl">{selectedMeme.emoji}</span>
            </div>
            <h2 className="text-xl font-bold text-ink mb-4 text-center">{selectedMeme.name}</h2>
            <div className="flex gap-3">
              <button className="btn-a flex-1 px-4 transition-colors">
                下载
              </button>
              <button
                className="flex-1 px-4 py-3 bg-surface-2 text-ink-2 font-semibold rounded-card hover:bg-surface-3 transition-all"
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
