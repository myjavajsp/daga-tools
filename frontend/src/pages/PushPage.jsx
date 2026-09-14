import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PushPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-6">推送管理</h1>
        <div className="bg-gray-800 rounded-xl p-6">
          <p className="text-gray-400">推送通知管理将在这里显示</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}