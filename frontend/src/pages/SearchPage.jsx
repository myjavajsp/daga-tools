import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';
import { EmptyState } from '../components/ToolUI';
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
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 col-md">
        {/* 页头 + 搜索框 */}
        <div className="mb-6">
          <div className="phead">
            <h1>影片搜索</h1>
            <span className="note">输入片名搜索影片，点击结果可直接进入解析播放</span>
          </div>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Icon name="search" className="sz15 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入影片名称，如：复仇者联盟"
                className="input pl-10"
              />
            </div>
            <button type="submit" disabled={loading || !keyword.trim()} className="btn-a px-6">
              {loading ? '搜索中…' : '搜索'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-card bg-danger-soft border border-line text-danger text-sm">
            {error}
          </div>
        )}

        {/* 降级提示 */}
        {degraded && (
          <div className="mb-4 p-4 rounded-card bg-warning-soft border border-line text-warning text-sm">
            {data.message || '搜索服务暂时不可用'}，请稍后重试
          </div>
        )}

        {/* 结果统计 */}
        {searched && !loading && !degraded && !error && (
          <div className="mb-4 text-sm text-ink-3">
            共找到 <span className="font-semibold text-ink">{total}</span> 条结果
          </div>
        )}

        {/* 空结果 */}
        {searched && !loading && !degraded && !error && list.length === 0 && (
          <EmptyState icon="search" title="没有找到相关影片" note="换个关键词试试吧" />
        )}

        {/* 加载骨架 */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-card bg-surface-2 animate-pulse aspect-[2/3]" />
            ))}
          </div>
        )}

        {/* 结果网格 */}
        {!loading && list.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {list.map((item) => {
              const card = (
                <>
                  <div className="relative aspect-[2/3] bg-surface-2 overflow-hidden">
                    {item.cover ? (
                      <img
                        src={proxyCover(item.cover)}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      /* 占位文案是内容不是控件，用 --ink-2 而不是最浅一档：
                         压 --surface-2 实测 6.11:1，--ink-3 只有 4.65:1，12px 太勉强。 */
                      <div className="w-full h-full flex items-center justify-center text-ink-2 text-xs">暂无封面</div>
                    )}
                    {item.score != null && (
                      /* 这两枚角标压在封面上，底色永远是黑遮罩，不随主题翻转，
                         所以用 .on-media 的固定浅色：换成 text-warning / text-ink-3 时，
                         浅色档的 #8a5a12 / #656c75 在黑遮罩上只有 2.5:1 / 3.4:1。 */
                      <span className="on-media absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-xs font-bold">
                        {item.score} 分
                      </span>
                    )}
                    {!item.page_url && (
                      /* 这里原来还叠了 opacity-90：角标本身已经有黑遮罩，
                         再乘一层透明度只是把 8.3:1 的白字压到 7.1，纯亏。 */
                      <span className="on-media absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-xs">
                        暂无播放页
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-ink truncate group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ink-3">
                      {item.year && <span>{item.year}</span>}
                      {item.year && item.desc && <span>·</span>}
                      <span className="truncate">{summarize(item.desc, 40)}</span>
                    </div>
                    {item.desc && (
                      <p className="mt-1.5 text-xs text-ink-3 leading-relaxed line-clamp-2">
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
                  className="group text-left rounded-card overflow-hidden bg-surface border border-line hover:shadow-lift hover:border-line transition-all duration-200"
                >
                  {card}
                </button>
              ) : (
                /* 不可点的卡片不再整块 opacity-60：这个遮罩会把片名、简介、
                   封面占位和角标一起压到 2~3:1。状态本来就有「暂无播放页」角标在说，
                   区别交给「没有 hover 抬升、不套 button」。 */
                <div
                  key={key}
                  className="rounded-card overflow-hidden bg-surface border border-line cursor-default"
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
              className="btn-ghost"
            >
              上一页
            </button>
            <span className="px-2 text-sm text-ink-3 mono">
              第 {page} / {pages} 页
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => gotoPage(page + 1)}
              className="btn-ghost"
            >
              下一页
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
