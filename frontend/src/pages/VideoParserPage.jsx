import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';
import FullscreenFrame from '../components/common/FullscreenFrame';
import { downloadBlob, safeName } from '../lib/file-utils';

/**
 * 视频在线播放页
 *
 * 之前这里是用 setTimeout 伪造结果的假实现，前端一直在调一个当时并不存在的
 * /api/video/parse。现在后端已真实实现该接口：
 *   - 长视频（腾讯/优酷/爱奇艺等）→ 返回后台配置的解析线路，用 iframe 内嵌播放
 *   - 短视频（抖音/快手等）      → 返回无水印下载地址，用 <video> 播放 + 下载
 */
export default function VideoParserPage() {
  // 支持从搜索页等入口带 ?url= 预填（如 /parser?url=https://www.iqiyi.com/v_xxx.html）
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(() => searchParams.get('url') || '');
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
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 col-md">
        {/* Page Header */}
        <div className="phead">
          <h1>视频在线播放</h1>
          <span className="note">支持腾讯视频、优酷、爱奇艺等长视频解析，以及抖音、快手等短视频去水印下载</span>
        </div>

        {/* Input Section */}
        <div className="card p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 relative min-w-0">
              <Icon name="link" className="sz15 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                placeholder="粘贴视频链接，如 https://v.douyin.com/xxxx/"
                className="input pl-10"
              />
            </div>
            <button
              onClick={handleParse}
              disabled={loading || !url.trim()}
              className="btn-a px-6"
            >
              {loading ? (
                <>
                  <span className="animate-spin spin sm inv" />
                  <span>解析中…</span>
                </>
              ) : (
                <>
                  <Icon name="play" />
                  <span>解析</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-danger text-sm flex items-center gap-2">
              <Icon name="alert" className="sz15" />
              {error}
            </p>
          )}

          {/* 今日剩余次数 */}
          {remaining != null && !quotaExceeded && (
            <p className="mt-3 text-ink-3 text-sm">今日剩余 {remaining} 次解析</p>
          )}

          {/* 配额用尽引导框 */}
          {quotaExceeded && (
            <div className="mt-3 rounded-card border border-line bg-warning-soft p-4">
              <p className="text-sm font-semibold text-warning">今日免费次数已用完</p>
              <p className="mt-1 text-xs text-warning">
                注册账号或升级会员，即刻获得更多每日解析次数。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/register"
                  className="btn-a warn px-4"
                >
                  免费注册
                </Link>
                <Link
                  to="/member"
                  className="btn-ghost px-4"
                >
                  我的会员
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 解析结果 */}
        {result && (
          <div className="card p-4 md:p-6 mb-6">
            {/* 短视频：封面 + 文案 + 下载 */}
            {!isVip && (
              <div className="space-y-4">
                {result.thumbnail && (
                  <div className="flex justify-center">
                    <img
                      src={result.thumbnail}
                      alt="封面"
                      className="max-h-64 rounded-card object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {result.title && (
                  <div>
                    <div className="text-xs text-ink-3 mb-1">视频文案</div>
                    <div className="text-sm text-ink-2 whitespace-pre-wrap break-words">
                      {result.title}
                    </div>
                  </div>
                )}
                {result.author && (
                  <div className="text-sm text-ink-3">作者：{result.author}</div>
                )}

                {result.formats?.length > 0 && (
                  <div className="space-y-2">
                    {result.formats.map((f, i) => {
                      const pct = dl[f.label] || 0;
                      const busy = pct > 0 && pct < 100;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-paper rounded-card p-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-ink">
                              {f.label}
                            </div>
                            <div className="text-xs text-ink-3 truncate">{f.url}</div>
                            {busy && (
                              <div className="mt-2 w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-success h-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                          {/* 下载中按钮显示百分比：它只是暂时不可点，不是「用不了」，
                              所以把 .btn-a:disabled 的失焦材质盖回实底强调（utilities 层能盖住
                              components 层），只换光标。 */}
                          <button
                            onClick={() => download(f)}
                            disabled={busy}
                            className="btn-a px-4 flex-none disabled:bg-accent disabled:text-accent-fg disabled:cursor-wait"
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
                  <span className="text-sm text-ink-2">解析线路：</span>
                  <select
                    value={vipUrl}
                    onChange={(e) => setVipUrl(e.target.value)}
                    className="input w-auto max-w-full"
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
                <p className="text-xs text-ink-3">
                  全屏请点播放器右上角的全屏按钮（Esc 退出）；若画面空白请切换其他线路。
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
