import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FullscreenFrame from '../components/common/FullscreenFrame';
import { fmtSize, downloadBlob, safeName, BTN_PRIMARY } from '../lib/file-utils';

/**
 * 视频在线播放页
 *
 * 之前这里是用 setTimeout 伪造结果的假实现，前端一直在调一个当时并不存在的
 * /api/video/parse。现在后端已真实实现该接口：
 *   - 长视频（腾讯/优酷/爱奇艺等）→ 返回后台配置的解析线路，用 iframe 内嵌播放
 *   - 短视频（抖音/快手等）      → 返回无水印下载地址，用 <video> 播放 + 下载
 */
export default function VideoParserPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [vipUrl, setVipUrl] = useState('');
  const [dl, setDl] = useState({}); // { [label]: percent }
  const [remaining, setRemaining] = useState(null); // 今日剩余解析次数（响应带回时展示）
  const [quotaExceeded, setQuotaExceeded] = useState(false); // 429 配额用尽引导

  const handleParse = async () => {
    const v = url.trim();
    if (!v) {
      setError('请输入视频链接');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setQuotaExceeded(false);
    try {
      // 已登录用户携带用户令牌（按用户等级计配额），否则按游客 IP 计配额
      const token = localStorage.getItem('daga_user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/video/parse', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: v }),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 429) {
        // 今日配额已用完：弹引导框（注册 / 会员中心）
        setQuotaExceeded(true);
        setRemaining(0);
        setLoading(false);
        return;
      }
      if (!json || !json.success) {
        throw new Error((json && (json.error || json.message)) || '解析失败，请检查链接是否正确');
      }
      const data = json.data || {};
      setResult(data);
      if (json.remaining != null) setRemaining(json.remaining);
      if (data.platform === 'vip' && data.playerUrl) setVipUrl(data.playerUrl);
    } catch (err) {
      setError(err?.message || '解析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /** 走同源代理下载，实时显示百分比 */
  const download = async (f) => {
    const key = f.label;
    try {
      const target = `/api/video/download?url=${encodeURIComponent(f.url)}&name=${encodeURIComponent(
        f.label === '背景音乐 MP3' ? 'audio' : 'video'
      )}`;
      const res = await fetch(target);
      if (!res.ok) throw new Error(`下载失败（HTTP ${res.status}）`);
      const total = Number(res.headers.get('Content-Length')) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) return;
        chunks.push(value);
        received += value.length;
        setDl((prev) => ({ ...prev, [key]: total ? Math.round((received / total) * 100) : 0 }));
        await pump();
      };
      await pump();
      const ext = /音乐|MP3/i.test(f.label) ? 'mp3' : 'mp4';
      const name = `${safeName(f.title || 'video')}.${ext}`;
      const blob = new Blob(chunks, { type: ext === 'mp3' ? 'audio/mpeg' : 'video/mp4' });
      downloadBlob(blob, name);
      setDl((prev) => ({ ...prev, [key]: 100 }));
      setTimeout(() => setDl((prev) => ({ ...prev, [key]: 0 })), 1800);
    } catch (err) {
      setError(err?.message || '下载失败');
    }
  };

  const isVip = result?.platform === 'vip';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-green-500 to-teal-500"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">视频在线播放</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3">
            支持腾讯视频、优酷、爱奇艺等长视频解析，以及抖音、快手等短视频去水印下载
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                ></path>
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                placeholder="粘贴视频链接，如 https://v.douyin.com/xxxx/"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 transition-all"
              />
            </div>
            <button
              onClick={handleParse}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>解析中…</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <span>解析</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </p>
          )}

          {/* 今日剩余次数 */}
          {remaining != null && !quotaExceeded && (
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm">今日剩余 {remaining} 次解析</p>
          )}

          {/* 配额用尽引导框 */}
          {quotaExceeded && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">今日免费次数已用完</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                注册账号或升级会员，即刻获得更多每日解析次数。
              </p>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
                >
                  免费注册
                </Link>
                <Link
                  to="/member"
                  className="px-4 py-2 rounded-lg border border-amber-400 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                >
                  我的会员
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 解析结果 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
            {/* 短视频：封面 + 文案 + 下载 */}
            {!isVip && (
              <div className="space-y-4">
                {result.thumbnail && (
                  <div className="flex justify-center">
                    <img
                      src={result.thumbnail}
                      alt="封面"
                      className="max-h-64 rounded-xl object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {result.title && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">视频文案</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {result.title}
                    </div>
                  </div>
                )}
                {result.author && (
                  <div className="text-sm text-gray-500">作者：{result.author}</div>
                )}

                {result.formats?.length > 0 && (
                  <div className="space-y-2">
                    {result.formats.map((f, i) => {
                      const pct = dl[f.label] || 0;
                      const busy = pct > 0 && pct < 100;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {f.label}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{f.url}</div>
                            {busy && (
                              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-green-500 h-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => download(f)}
                            disabled={busy}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:shadow-md disabled:opacity-50 flex-shrink-0"
                          >
                            {busy ? `${pct}%` : pct === 100 ? '完成' : '下载'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 长视频 VIP：线路切换 + iframe 播放 */}
            {isVip && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">解析线路：</span>
                  <select
                    value={vipUrl}
                    onChange={(e) => setVipUrl(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                  >
                    {result.interfaces?.map((it, i) => (
                      <option key={i} value={it.url}>
                        {it.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-lg overflow-hidden bg-black">
                  <FullscreenFrame src={vipUrl} title={result.title || 'VIP 视频解析'} />
                </div>
                <p className="text-xs text-gray-400">
                  全屏请点播放器右上角的全屏按钮（Esc 退出）；若画面空白请切换其他线路。
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
