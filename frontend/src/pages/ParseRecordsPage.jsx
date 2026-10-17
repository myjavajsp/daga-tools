import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ParseRecordsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="wrap py-12">
        <h1 className="text-2xl font-bold text-ink mb-6">解析记录</h1>
        <div className="card p-6">
          <p className="text-ink-3">视频解析记录将在这里显示</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}