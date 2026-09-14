import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MemesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">更多表情包</h1>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-3xl">😄</span>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}