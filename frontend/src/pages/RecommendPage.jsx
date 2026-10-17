import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';
import Reveal from '../components/Reveal';
import client from '../api/client';

/**
 * RecommendPage — 影视推荐列表页
 *
 * 调用后端 /api/public/articles 接口，展示已发布的影视文章。
 * 支持分页、封面图、分类标签。
 */
export default function RecommendPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 12;

  useEffect(() => {
    loadArticles();
  }, [page]);

  async function loadArticles() {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/public/articles', {
        params: { page, limit: PAGE_SIZE },
      });
      const data = res.data;
      if (data && data.success) {
        setArticles(data.data.list || []);
        const total = data.data.total || 0;
        setTotalPages(Math.ceil(total / PAGE_SIZE));
      } else {
        // API 返回 success=false，按空数据处理（不报错）
        setArticles([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('[RecommendPage]', err.message);
      // 本地无后端或网络错误：显示空态而非错误页，方便本地预览布局
      setArticles([]);
      setTotalPages(1);
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
      <div className="min-h-screen bg-paper">
        <Header />
        <main className="wrap py-8 flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="animate-spin spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="wrap py-8 max-w-content">
        <div className="phead">
          <h1>影视推荐</h1>
          <span className="note">编辑精选好剧好片</span>
        </div>

        {articles.length === 0 ? (
          <div className="card p-8 text-center">
            <Icon name="doc" className="sz15 mx-auto mb-3" />
            <p className="text-ink-2">暂无推荐内容</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Reveal key={article.id} as="article" className="card overflow-hidden hover:border-accent transition-colors cursor-pointer">
                  <Link to={`/recommend/${article.slug}`} className="block">
                    {article.cover_image ? (
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-surface-2 flex items-center justify-center">
                        <Icon name="film" className="sz15 text-ink-3" />
                      </div>
                    )}
                    <div className="p-5">
                      <h2 className="text-ink font-semibold mb-2 line-clamp-2">{article.title}</h2>
                      {article.excerpt && (
                        <p className="text-ink-3 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 text-ink-3 text-xs">
                        {article.category && (
                          <span className="chip">{article.category}</span>
                        )}
                        {article.published_at && (
                          <span>{formatDate(article.published_at)}</span>
                        )}
                        {article.views != null && (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="eye" className="sz12" />
                            {article.views}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  className="btn-ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  上一页
                </button>
                <span className="text-ink-3 text-sm px-3">
                  第 {page} / {totalPages} 页
                </span>
                <button
                  className="btn-ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
