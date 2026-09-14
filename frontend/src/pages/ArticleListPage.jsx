import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadArticles();
  }, [page]);

  const loadArticles = async () => {
    try {
      const mockArticles = [
        { id: 1, slug: 'welcome', title: '欢迎来到全民影视', date: '2024-01-15', views: 5678 },
        { id: 2, slug: 'update-v2', title: '网站功能更新公告', date: '2024-01-10', views: 3456 },
        { id: 3, slug: 'tutorial', title: '视频解析使用教程', date: '2024-01-05', views: 2345 },
      ];
      setArticles(mockArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          文章列表
        </h1>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {articles.map(article => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="block bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
            >
              <h2 className="text-xl font-semibold text-white mb-2">{article.title}</h2>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>📅 {article.date}</span>
                <span>👁️ {article.views} 阅读</span>
              </div>
            </Link>
          ))}
        </div>
        
        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">暂无文章</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}