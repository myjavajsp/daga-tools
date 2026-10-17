import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';
import { useNavigate, Link } from 'react-router-dom';

/* 测试卡片的图标：按测试类型映射到线性图标（旧写法是每个类型一个 emoji） */
const TEST_ICON = { mbti: 'scan', enneagram: 'sliders', career: 'idcard' };

export default function MbtiTestPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const mockTests = [
        { id: 1, name: 'MBTI性格测试', type: 'mbti', questions: 20, time: '10分钟' },
        { id: 2, name: '九型人格测试', type: 'enneagram', questions: 15, time: '8分钟' },
        { id: 3, name: '职业倾向测试', type: 'career', questions: 25, time: '15分钟' },
      ];
      setTests(mockTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test) => {
    navigate(`/tests/${test.type}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="animate-spin spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      
      <main className="wrap py-8 max-w-4xl">
        <div className="phead">
          <h1>在线心理测试</h1>
          <span className="note">结果仅供参考</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(test => (
            <Link
              key={test.id}
              to={`/tests/${test.type}`}
              className="card p-5 hover:border-accent transition-colors block"
            >
              <span className="chip mb-3"><Icon name={TEST_ICON[test.type] || 'users'} /></span>
              <h3 className="text-lg font-bold text-ink mb-2">{test.name}</h3>
              <div className="flex flex-wrap gap-3 text-ink-3 text-sm">
                <span className="inline-flex items-center gap-1.5"><Icon name="pen" />{test.questions} 题</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="timer" />{test.time}</span>
              </div>
              <span className="btn-a w-full mt-4">开始测试</span>
            </Link>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}