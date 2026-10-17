import Header from '../components/Header';
import Icon from '../components/Icons';
import Footer from '../components/Footer';

export default function Mp4PlayerPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="wrap py-8 col-sm">
        {/* Page Header */}
        <div className="phead">
          <h1>MP4 在线播放</h1>
          <span className="note">支持 MP4 格式视频在线播放</span>
        </div>

        {/* Player Section */}
        <div className="card p-4 md:p-6 mb-6">
          <div className="aspect-video bg-surface-2 rounded-card flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-3"><span className="chip"><Icon name="filmstrip" /></span></div>
              <p className="text-ink-3">MP4 播放器</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-3">支持的格式</h3>
          <div className="flex flex-wrap gap-2">
            {['MP4', 'H.264', 'H.265', 'WebM', 'AVI'].map((format) => (
              <span key={format} className="px-3 py-1.5 bg-warning-soft text-warning rounded-lg text-sm font-medium">
                {format}
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
