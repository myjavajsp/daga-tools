import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';

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
    <div className="min-h-screen bg-paper">
      <Header />
      
      <main className="wrap py-8 col-md">
        {/* Page Title */}
        <div className="phead">
          <h1>音乐搜索</h1>
          <span className="note">在线搜索和试听全网音乐</span>
        </div>

        {/* Search Box */}
        <div className="card p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 relative min-w-0">
              <Icon name="search" className="sz15 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                type="text"
                placeholder="输入歌曲名或歌手名..."
                className="input pl-10"
              />
            </div>
            <button className="btn-a px-6">
              <Icon name="search" />
              <span>搜索</span>
            </button>
          </div>
        </div>

        {/* Hot Songs */}
        <div className="mb-6">
          <div className="sechead"><h2>热门歌曲</h2></div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin spin" />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-3">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-3">歌曲名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-3">歌手</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-ink-3">专辑</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-3">时长</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {songs.map((song, idx) => (
                    <tr key={song.id} className="hover:bg-surface-2 transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-sm text-ink-3">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink">{song.title}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-2">{song.artist}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-ink-3">{song.album}</td>
                      <td className="px-4 py-3 text-right text-sm text-ink-3">{song.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="statgrid">
          {[
            { n: '128万', t: '热门歌曲' },
            { n: '56万', t: '歌手数据' },
            { n: '89万', t: '专辑数量' },
            { n: '45万', t: '今日播放' },
          ].map((s) => (
            <div key={s.t} className="card statcard">
              <div className="n">{s.n}</div>
              <div className="t">{s.t}</div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
