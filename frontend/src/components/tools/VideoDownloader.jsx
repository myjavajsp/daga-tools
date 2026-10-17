import { useState } from 'react';
import FullscreenFrame from '../common/FullscreenFrame';

/** 生成安全文件名（去非法字符、限长） */
function safeName(s) {
  return (
    String(s || '')
      .replace(/[\\/:*?"<>|\r\n\t]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40) || 'video'
  );
}

/** 由 MIME 推断扩展名 */
function extFromMime(mime) {
  const m = (mime || '').toLowerCase();
  if (m.includes('mpeg') && m.startsWith('audio')) return 'mp3';
  if (m.includes('mp4') && m.startsWith('audio')) return 'm4a';
  if (m.includes('mp4')) return 'mp4';
  if (m.includes('webm')) return 'webm';
  if (m.includes('quicktime')) return 'mov';
  if (m.includes('flv')) return 'flv';
  if (m.includes('m3u8') || m.includes('mpegurl')) return 'm3u8';
  return 'mp4';
}

/** 字节数格式化 */
function fmtBytes(n) {
  if (!n) return '';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [vipUrl, setVipUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // 下载状态：idx=-1 无；percent=-1 表示「准备中」，0-100 为进度
  const [dl, setDl] = useState({ idx: -1, percent: -1, done: false });

  const parse = async () => {
    const target = url.trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setResult(null);
    setVipUrl('');
    try {
      // 已登录用户携带用户令牌（按用户等级计配额），否则按游客 IP 计配额
      const token = localStorage.getItem('daga_user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/video/parse', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || '解析失败');
      setResult(data.data);
      if (data.data.platform === 'vip') setVipUrl(data.data.playerUrl);
    } catch (e) {
      setError(e.message || '解析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /** 走后端代理下载，实时显示进度 */
  const download = async (f, i) => {
    if (dl.idx !== -1) return; // 已有任务在进行
    setError('');
    setDl({ idx: i, percent: -1, done: false });
    let objectUrl = '';
    try {
      const href =
        '/api/video/download?url=' +
        encodeURIComponent(f.url) +
        '&name=' +
        encodeURIComponent(safeName(result && result.title));
      const res = await fetch(href);
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t.slice(0, 120) || '源站返回 ' + res.status);
      }

      const mime = res.headers.get('content-type') || 'video/mp4';
      const total = Number(res.headers.get('content-length') || 0);
      const reader = res.body && res.body.getReader();
      if (!reader) throw new Error('当前浏览器不支持流式下载');

      const chunks = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) {
          setDl({ idx: i, percent: Math.min(99, Math.round((received * 100) / total)), done: false });
        }
      }

      const blob = new Blob(chunks, { type: mime });
      objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = safeName(result && result.title) + '.' + extFromMime(mime);
      document.body.appendChild(a);
      a.click();
      a.remove();

      setDl({ idx: i, percent: 100, done: true });
      setTimeout(() => setDl({ idx: -1, percent: -1, done: false }), 1800);
    } catch (e) {
      setError('下载失败：' + (e.message || '未知错误') + '。若提示地址过期，请重新解析。');
      setDl({ idx: -1, percent: -1, done: false });
    } finally {
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
    }
  };

  /** 按钮内容：准备中 / 百分比 / 完成 */
  const btnContent = (i) => {
    if (dl.idx !== i) return '下载';
    if (dl.done) return '完成';
    if (dl.percent < 0) return '准备中…';
    return dl.percent + '%';
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-3">
        支持抖音、快手等短视频去水印解析下载，以及腾讯视频、优酷、爱奇艺等 VIP 视频在线解析播放。
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && parse()}
          placeholder="粘贴视频链接，如 https://v.douyin.com/xxxx/"
          className="flex-1 px-4 py-3 bg-paper border border-line rounded-card text-ink"
        />
        <button
          onClick={parse}
          disabled={!url.trim() || loading}
          className="btn-a px-6"
        >
          {loading ? '解析中…' : '解析'}
        </button>
      </div>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {/* VIP 长视频：内嵌播放 */}
      {result && result.platform === 'vip' && (
        <div className="bg-paper rounded-card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink-2">选择解析线路：</span>
            <select
              value={vipUrl}
              onChange={(e) => setVipUrl(e.target.value)}
              className="input"
            >
              {result.interfaces?.map((it, i) => (
                <option key={i} value={it.url}>
                  {it.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full rounded-lg overflow-hidden bg-black">
            <FullscreenFrame key={vipUrl} src={vipUrl} title="VIP 视频解析播放" />
          </div>
          <p className="text-xs text-ink-3">
            若播放器空白，请切换其他线路；全屏请点播放器右上角的全屏按钮（或按 Esc 退出）。
          </p>
        </div>
      )}

      {/* 短视频：去水印下载 */}
      {result && result.formats && (
        <div className="bg-paper rounded-card p-4 space-y-3">
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt=""
              className="w-32 h-32 object-cover rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="font-medium text-ink break-words">{result.title}</div>
          {result.author && (
            <div className="text-xs text-ink-3">作者：{result.author}</div>
          )}
          <div className="space-y-2">
            {result.formats.map((f, i) => {
              const active = dl.idx === i;
              const pct = active && dl.percent >= 0 ? dl.percent : 0;
              return (
                <div
                  key={i}
                  className="relative overflow-hidden bg-surface rounded-lg px-4 py-3"
                >
                  {/* 进度条底衬 */}
                  {active && !dl.done && (
                    <div
                      className="absolute inset-y-0 left-0 bg-accent-soft transition-all duration-200"
                      style={{ width: (dl.percent < 0 ? 8 : Math.max(pct, 5)) + '%' }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink-2">{f.label}</span>
                      {f.size && <span className="text-xs text-ink-3">{f.size}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => download(f, i)}
                      disabled={dl.idx !== -1 && !active}
                      className={
                        'btn-a px-4 py-1.5' +
                        (active
                          ? dl.done
                            ? ' ok'
                            : ' cursor-wait'
                          : '')
                      }
                    >
                      {active && !dl.done && dl.percent < 0 && (
                        <span className="animate-spin spin sm inv" />
                      )}
                      {btnContent(i)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-ink-3">
            点击「下载」后会先由服务器从源站取流（显示「准备中…」），随后显示进度百分比，完成后自动保存到本地。
            若失败多为抖音签名地址已过期（约 10 分钟），重新解析即可。
          </p>
        </div>
      )}
    </div>
  );
}
