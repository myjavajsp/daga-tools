import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';
import client from '../api/client';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  async function loadArticle() {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get(`/public/articles/${slug}`);
      const data = res.data;
      if (data && data.success) {
        setArticle(data.data);
      } else {
        setError('文章不存在');
      }
    } catch (err) {
      console.error('[ArticleDetailPage]', err.message);
      // 本地无后端或网络错误：显示空态
      setError('文章不存在');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="animate-spin spin"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <main className="wrap py-8 max-w-content">
          <div className="card p-8 text-center">
            <Icon name="alert" className="sz15 mx-auto mb-3" />
            <p className="text-ink-2">{error || '文章不存在'}</p>
            <button className="btn-a mt-4" onClick={() => navigate(-1)}>返回</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      
      <main className="wrap py-8 max-w-content">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-accent transition-colors mb-5 min-h-10"
        >
          <Icon name="arrow" className="rotate-180" />
          返回列表
        </button>

        <article className="card overflow-hidden">
          {article.cover_image && (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          )}
          <div className="p-5 sm:p-8">
            <h1 className="text-2xl font-bold text-ink mb-3 tracking-tight">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-ink-3 text-sm mb-6 pb-5 border-b border-line">
              {article.author && (
                <span className="inline-flex items-center gap-1.5"><Icon name="user" className="sz12" />{article.author}</span>
              )}
              {article.published_at && (
                <span className="inline-flex items-center gap-1.5"><Icon name="calendar" className="sz12" />{formatDate(article.published_at)}</span>
              )}
              {article.views != null && (
                <span className="inline-flex items-center gap-1.5"><Icon name="eye" className="sz12" />{article.views} 阅读</span>
              )}
              {article.category && (
                <span className="chip">{article.category}</span>
              )}
            </div>

            {/* .article 是真正生效的正文刻度 */}
            <div className="article" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}