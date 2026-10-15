import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { searchVideos } from '../api/search';

/** 封面图走同源 img-proxy 代理，规避爱奇艺图片防盗链 */
function proxyCover(src) {
  if (!src) return '';
  return '/api/public/img-proxy?url=' + encodeURIComponent(src);
}

/** 简介摘要：单行 + 截断 */
function summarize(text, max = 80) {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? flat.slice(0, max) + '…' : flat;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQ = searchParams.get('q') || '';
  const initialPage = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const [keyword, setKeyword] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const res = await searchVideos(q, page);
      if (res && res.success) {
        setData(res.data || { list: [], total: 0, page });
      } else {
        setError((res && res.error) || '搜索失败，请稍后重试');
        setData(null);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || '搜索失败，请稍后重试');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  // URL 参数（q/page）变化时同步查询
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setPage(Math.max(1, parseInt(searchParams.get('page'), 10) || 1));
  }, [searchParams]);

  useEffect(() => { load(); }, [load]);

  const submit = (e) => {
    e.preventDefault();
    const kw = keyword.trim();
    if (!kw) return;
    setSearchParams({ q: kw, page: '1' });
  };

  const gotoPage = (p) => {
    setSearchParams({ q, page: String(p) });
  };

  const openResult = (item) => {
    if (item.page_url) {
      navigate(`/parser?url=${encodeURIComponent(item.page_url)}`);
    }
  };

  const list = (data && data.list) || [];
  const degraded = !!(data && data.degraded);
  const total = data ? data.total : 0;
  const pages = data && data.pages ? data.pages : 1;
  const searched = !!q;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 页头 + 搜索框 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">影片搜索</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3 mb-4">
            输入片名搜索影片，点击结果可直接进入解析播放
          </p>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入影片名称，如：复仇者联盟"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* 降级提示 */}
        {degraded && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
            {data.message || '搜索服务暂时不可用'}，请稍后重试
          </div>
        )}

        {/* 结果统计 */}
        {searched && !loading && !degraded && !error && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            共找到 <span className="font-semibold text-gray-900 dark:text-white">{total}</span> 条结果
          </div>
        )}

        {/* 空结果 */}
        {searched && !loading && !degraded && !error && list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <p className="text-sm">没有找到相关影片，换个关键词试试吧</p>
          </div>
        )}

        {/* 加载骨架 */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse aspect-[2/3]" />
            ))}
          </div>
        )}

        {/* 结果网格 */}
        {!loading && list.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {list.map((item) => {
              const card = (
                <>
                  <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {item.cover ? (
                      <img
                        src={proxyCover(item.cover)}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">暂无封面</div>
                    )}
                    {item.score != null && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-amber-400 text-xs font-bold">
                        {item.score} 分
                      </span>
                    )}
                    {!item.page_url && (
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-gray-300 text-xs">
                        暂无播放页
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      {item.year && <span>{item.year}</span>}
                      {item.year && item.desc && <span>·</span>}
                      <span className="truncate">{summarize(item.desc, 40)}</span>
                    </div>
                    {item.desc && (
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {summarize(item.desc, 80)}
                      </p>
                    )}
                  </div>
                </>
              );
              const key = item.id || item.page_url || item.name;
              // 有播放页 → 可点击进入解析；无播放页（如即将上线）→ 静态展示
              return item.page_url ? (
                <button
                  key={key}
                  type="button"
                  onClick={() => openResult(item)}
                  className="group text-left rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200"
                >
                  {card}
                </button>
              ) : (
                <div
                  key={key}
                  className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-60 cursor-default"
                >
                  {card}
                </div>
              );
            })}
          </div>
        )}

        {/* 分页 */}
        {!loading && !degraded && pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => gotoPage(page - 1)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              第 {page} / {pages} 页
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => gotoPage(page + 1)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
