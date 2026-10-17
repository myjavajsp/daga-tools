import { useState } from 'react';
import MediaPlayerTool from '../components/MediaPlayerTool';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';

export default function M3u8PlayerPage() {
  const [url, setUrl] = useState('');
  
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="wrap py-8 col-sm">
        {/* Page Header */}
        <div className="phead">
          <h1>M3U8 在线播放</h1>
          <span className="note">支持 M3U8 视频流在线播放</span>
        </div>

        {/* Player Section */}
        <div className="card p-4 md:p-6 mb-6">
          <MediaPlayerTool url={url} title="视频播放" />
          
          {/* Input Section */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative min-w-0">
              <Icon name="link" className="sz15 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入 M3U8 链接..."
                className="input pl-10"
              />
            </div>
            <button onClick={() => {}} className="btn-a px-6">
              <Icon name="play" />
              <span>播放</span>
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="card p-5">
          <h3 className="lbl mb-3">支持格式</h3>
          <div className="flex flex-wrap gap-2">
            {['M3U8', 'HLS', 'MP4', 'WebM'].map((format) => (
              <span key={format} className="badge">{format}</span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
