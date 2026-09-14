import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MediaPlayerTool from '../components/MediaPlayerTool';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      // 模拟文章数据
      const mockArticle = {
        id: slug,
        title: '这篇文章的标题',
        content: '这是文章的内容...\n\n这里是正文部分...',
        author: '管理员',
        date: '2024-01-01',
        views: 1234
      };
      setArticle(mockArticle);
    } catch (error) {
      console.error('Failed to load article:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!article) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white">文章不存在</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
        
        <article className="bg-gray-800 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-gray-400 text-sm mb-8">
            <span>👤 {article.author}</span>
            <span>📅 {article.date}</span>
            <span>👁️ {article.views} 阅读</span>
          </div>
          
          <div className="prose prose-invert max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
}