import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TestsPage() {
  const [tests] = useState([
    { id: 1, name: 'MBTI性格测试', slug: 'mbti', code: 'test1' },
    { id: 2, name: '职业倾向测试', slug: 'career', code: 'test2' },
  ]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">在线测试</h1>
        <div className="max-w-2xl mx-auto space-y-4">
          {tests.map(test => (
            <div key={test.id} className="bg-gray-800 rounded-xl p-6 flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{test.name}</h3>
                <p className="text-gray-400 text-sm">点击开始测试</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                开始
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}