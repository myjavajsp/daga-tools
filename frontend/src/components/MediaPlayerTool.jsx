import { useState, useRef, useEffect } from 'react';
import Icon from './Icons';

export default function MediaPlayerTool({ url, title }) {
  const [fullView, setFullView] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // 原生全屏（按 Esc、系统手势）不会经过我们的按钮，必须监听 fullscreenchange
  // 把按钮状态同步回来，否则退出全屏后按钮永远停在「退出全屏」。
  useEffect(() => {
    const onChange = () => setFullView(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    setError(null);
  }, [url]);

  const toggleFullScreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch((err) => console.error('Fullscreen error:', err));
    } else {
      document.exitFullscreen();
    }
  };

  if (!url) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-2 border border-line rounded-card">
        <p className="text-ink-3 text-sm">请输入视频链接</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-card overflow-hidden shadow-card bg-black">
      <video
        ref={videoRef}
        src={url}
        className="w-full aspect-video bg-black"
        controls
        playsInline
        onError={() => setError('视频加载失败，请检查链接是否有效')}
      >
        您的浏览器不支持视频播放
      </video>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="on-media text-center px-4">{error}</p>
        </div>
      )}

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={toggleFullScreen}
          className="on-media p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
          title={fullView ? '退出全屏' : '全屏播放'}
          aria-label={fullView ? '退出全屏' : '全屏播放'}
        >
          <Icon name={fullView ? 'compress' : 'expand'} />
        </button>
      </div>

      {/* 片名压在画面上，底下的黑渐变是遮罩（scrim），属于功能性渐变而非装饰 */}
      {title && !error && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <h3 className="on-media font-medium">{title}</h3>
        </div>
      )}
    </div>
  );
}
