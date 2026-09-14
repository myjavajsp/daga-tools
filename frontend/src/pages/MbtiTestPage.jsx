import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function MbtiTestPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          在线心理测试
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => (
            <div
              key={test.id}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer"
              onClick={() => startTest(test)}
            >
              <div className="text-4xl mb-4">
                {test.type === 'mbti' ? '🧠' : test.type === 'enneagram' ? '🔢' : '💼'}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{test.name}</h3>
              <div className="flex gap-4 text-gray-400 text-sm">
                <span>📝 {test.questions}题</span>
                <span>⏱️ {test.time}</span>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                开始测试
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}