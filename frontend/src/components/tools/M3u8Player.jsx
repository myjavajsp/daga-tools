import { useState, useRef } from 'react';
import Icon from '../Icons';
export default function M3u8Player() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const play = () => {
    if (!url.trim()) return;
    setError('');
    try {
      const video = videoRef.current;
      if (video) {
        video.src = url;
        video.load();
      }
    } catch (e) {
      setError('链接无效，请输入合法的M3U8地址');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="粘贴M3U8播放链接..."
          className="flex-1 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
        <button onClick={play} disabled={!url.trim()} className="btn-a px-6">
          播放
        </button>
      </div>

      <div className="relative rounded-card overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          style={{ display: url ? 'block' : 'none' }}
        >
          您的浏览器不支持视频播放
        </video>
        {!url && (
          /* 这块空状态压在 bg-black 的舞台上，必须用 .on-media（写死的 #f2f4f7）；
             沿用 text-ink-3 时实测对比度只有 3.96:1，低于正文 4.5:1 门槛。 */
          <div className="on-media absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-3"><span className="chip"><Icon name="filmstrip" /></span></div>
              <p>输入M3U8链接开始播放</p>
              <p className="on-media mt-2 text-xs opacity-90">支持 http:// 和 https:// 开头地址</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="bg-paper rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">使用说明</div>
        <ul className="space-y-1 text-xs">
          <li>• 输入M3U8格式的播放链接（如直播源、点播源）</li>
          <li>• 建议使用Chrome或Edge浏览器以获得最佳兼容性</li>
          <li>• 部分链接可能受跨域限制，请确保链接可访问</li>
          <li>• 支持 HLS 协议直播流播放</li>
        </ul>
      </div>
    </div>
  );
}
