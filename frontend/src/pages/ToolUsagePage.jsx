import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ToolUsagePage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="wrap py-12">
        <h1 className="text-2xl font-bold text-ink mb-6">工具使用统计</h1>
        <div className="card p-6">
          <p className="text-ink-3">工具使用数据将在这里显示</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}