import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import Icon from '../Icons';

export default function M3u8Player() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // 清理 HLS 实例
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const play = () => {
    if (!url.trim()) {
      setError('请输入播放链接');
      return;
    }

    setError('');
    setIsPlaying(true);

    const video = videoRef.current;
    if (!video) return;

    // 销毁旧的 HLS 实例
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // 检测是否支持原生 HLS（Safari）
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.load();
      video.play().catch(err => {
        console.error('播放失败:', err);
        setError('播放失败，请检查链接是否有效');
      });
      return;
    }

    // 使用 hls.js 播放
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS 错误:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('网络错误，无法加载视频。请检查链接是否有效或网络连接。');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('媒体格式错误，视频无法播放。');
              break;
            default:
              setError('播放出错，请重试。');
              break;
          }
          hls.destroy();
          hlsRef.current = null;
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => {
          console.error('自动播放被阻止:', err);
        });
      });
    } else {
      setError('您的浏览器不支持 HLS 播放，请使用 Chrome、Edge 或 Safari 浏览器。');
    }
  };

  const stop = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    setIsPlaying(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            setError('');
          }}
          placeholder="粘贴M3U8播放链接..."
          className="flex-1 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
        <button 
          onClick={isPlaying ? stop : play} 
          disabled={!url.trim()} 
          className="btn-a px-6"
        >
          {isPlaying ? '停止' : '播放'}
        </button>
      </div>

      <div className="relative rounded-card overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full h-full"
          style={{ display: isPlaying || url ? 'block' : 'none' }}
        >
          您的浏览器不支持视频播放
        </video>
        {!isPlaying && !url && (
          <div className="on-media absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-3"><span className="chip"><Icon name="filmstrip" /></span></div>
              <p>输入M3U8链接开始播放</p>
              <p className="on-media mt-2 text-xs opacity-90">支持 http:// 和 https:// 开头的 HLS 流</p>
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
          <li>• 建议使用Chrome、Edge或Safari浏览器以获得最佳兼容性</li>
          <li>• 部分链接可能受跨域限制，请确保链接可访问</li>
          <li>• 支持 HLS 协议直播流和点播流播放</li>
          <li>• 如果链接带认证参数（auth_key），请确保未过期</li>
        </ul>
      </div>
    </div>
  );
}
