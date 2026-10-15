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
    if (dl.done) return '完成 ✓';
    if (dl.percent < 0) return '准备中…';
    return dl.percent + '%';
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        支持抖音、快手等短视频去水印解析下载，以及腾讯视频、优酷、爱奇艺等 VIP 视频在线解析播放。
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && parse()}
          placeholder="粘贴视频链接，如 https://v.douyin.com/xxxx/"
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
        />
        <button
          onClick={parse}
          disabled={!url.trim() || loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50"
        >
          {loading ? '解析中…' : '解析'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* VIP 长视频：内嵌播放 */}
      {result && result.platform === 'vip' && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">选择解析线路：</span>
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
          <div className="w-full rounded-lg overflow-hidden bg-black">
            <FullscreenFrame key={vipUrl} src={vipUrl} title="VIP 视频解析播放" />
          </div>
          <p className="text-xs text-gray-400">
            若播放器空白，请切换其他线路；全屏请点播放器右上角的全屏按钮（或按 Esc 退出）。
          </p>
        </div>
      )}

      {/* 短视频：去水印下载 */}
      {result && result.formats && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt=""
              className="w-32 h-32 object-cover rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="font-medium text-gray-900 dark:text-white break-words">{result.title}</div>
          {result.author && (
            <div className="text-xs text-gray-500 dark:text-gray-400">作者：{result.author}</div>
          )}
          <div className="space-y-2">
            {result.formats.map((f, i) => {
              const active = dl.idx === i;
              const pct = active && dl.percent >= 0 ? dl.percent : 0;
              return (
                <div
                  key={i}
                  className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg px-4 py-3"
                >
                  {/* 进度条底衬 */}
                  {active && !dl.done && (
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-100 dark:bg-blue-900/40 transition-all duration-200"
                      style={{ width: (dl.percent < 0 ? 8 : Math.max(pct, 5)) + '%' }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</span>
                      {f.size && <span className="text-xs text-gray-400">{f.size}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => download(f, i)}
                      disabled={dl.idx !== -1 && !active}
                      className={
                        'inline-flex items-center gap-1.5 px-4 py-1.5 text-white text-sm rounded-lg ' +
                        (active
                          ? dl.done
                            ? 'bg-green-500'
                            : 'bg-blue-400 cursor-wait'
                          : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50')
                      }
                    >
                      {active && !dl.done && dl.percent < 0 && (
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      )}
                      {btnContent(i)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            点击「下载」后会先由服务器从源站取流（显示「准备中…」），随后显示进度百分比，完成后自动保存到本地。
            若失败多为抖音签名地址已过期（约 10 分钟），重新解析即可。
          </p>
        </div>
      )}
    </div>
  );
}
