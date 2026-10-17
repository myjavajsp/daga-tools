import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TestsPage() {
  const [tests] = useState([
    { id: 1, name: 'MBTI性格测试', slug: 'mbti', code: 'test1' },
    { id: 2, name: '职业倾向测试', slug: 'career', code: 'test2' },
  ]);
  
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="wrap py-8 col-sm">
        <div className="phead">
          <h1>在线测试</h1>
          <span className="note">结果仅供参考</span>
        </div>
        <div className="space-y-3">
          {tests.map(test => (
            <div key={test.id} className="card p-6 flex justify-between items-center">
              <div>
                <h3 className="text-ink font-medium">{test.name}</h3>
                <p className="text-ink-3 text-sm">点击开始测试</p>
              </div>
              <button className="btn-a px-4">
                开始
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}