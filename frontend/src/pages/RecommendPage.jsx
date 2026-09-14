import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RecommendPage() {
  const recommends = [
    { title: '推荐视频1', desc: '描述1' },
    { title: '推荐视频2', desc: '描述2' },
    { title: '推荐视频3', desc: '描述3' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">热门推荐</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommends.map((r, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-medium mb-2">{r.title}</h3>
              <p className="text-gray-400 text-sm">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}