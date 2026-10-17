import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';
import { EmptyState } from '../components/ToolUI';

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
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="animate-spin spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      
      <main className="wrap py-8 max-w-3xl">
        <div className="phead">
          <h1>文章列表</h1>
          <span className="note">公告与使用教程</span>
        </div>

        <div className="space-y-3">
          {articles.map(article => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="block card p-5 hover:border-accent transition-colors"
            >
              <h2 className="text-lg font-semibold text-ink mb-2">{article.title}</h2>
              <div className="flex items-center gap-4 text-ink-3 text-sm">
                <span className="inline-flex items-center gap-1.5"><Icon name="calendar" />{article.date}</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="eye" />{article.views} 阅读</span>
              </div>
            </Link>
          ))}
        </div>
        
        {articles.length === 0 && (
          <EmptyState icon="doc" title="暂无文章" />
        )}
      </main>
      
      <Footer />
    </div>
  );
}