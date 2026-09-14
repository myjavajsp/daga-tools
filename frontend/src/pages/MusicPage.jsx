import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MusicPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const mockSongs = [
        { id: 1, title: '晴天', artist: '周杰伦', album: '叶惠美', duration: '4:29' },
        { id: 2, title: '稻香', artist: '周杰伦', album: '魔杰座', duration: '3:44' },
        { id: 3, title: '孤勇者', artist: '陈奕迅', album: '孤勇者', duration: '4:16' },
        { id: 4, title: '漠河舞厅', artist: '柳爽', album: '漠河舞厅', duration: '4:35' },
      ];
      setSongs(mockSongs);
    } catch (error) {
      console.error('Failed to load songs:', error);
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
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-pink-500 to-rose-500"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">音乐搜索</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3">在线搜索和试听全网音乐</p>
        </div>

        {/* Search Box */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="输入歌曲名或歌手名..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/50 transition-all"
              />
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span className="hidden sm:inline">搜索</span>
            </button>
          </div>
        </div>

        {/* Hot Songs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-pink-500 to-rose-500"></div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">热门歌曲</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-pink-500"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">歌曲名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">歌手</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">专辑</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">时长</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {songs.map((song, idx) => (
                    <tr key={song.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 dark:text-white">{song.title}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{song.artist}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{song.album}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">{song.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">128万</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">热门歌曲</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">56万</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">歌手数据</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">89万</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">专辑数量</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">45万</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">今日播放</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
