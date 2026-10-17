import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SubmissionsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="wrap py-12">
        <h1 className="text-2xl font-bold text-ink mb-6">用户提交</h1>
        <div className="card p-6">
          <p className="text-ink-3">用户提交记录将在这里显示</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}