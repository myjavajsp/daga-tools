import { useState, useRef, useEffect } from 'react';

export default function MediaPlayerTool({ url, title }) {
  const [fullView, setFullView] = useState(false);
  const videoRef = useRef(null);
  const playerElement = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 初始化播放器
    const video = videoRef.current;
    if (video && url) {
      video.src = url;
      video.load();
    }
    
    // 设置鼠标事件处理
    const handleMouseEnter = () => {
      if (playerElement.current) {
        try {
          playerElement.current.dispatchEvent(new MouseEvent("mouseenter", {bubbles:true, cancelable:true, view:window}));
        } catch(e) {}
      }
    };
    
    const handleMouseLeave = () => {
      if (playerElement.current) {
        try {
          playerElement.current.dispatchEvent(new MouseEvent("mouseleave", {bubbles:true, cancelable:true, view:window}));
        } catch(e) {}
      }
    };
    
    const element = playerElement.current;
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (element) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [url]);

  const toggleFullScreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
      setFullView(true);
    } else {
      document.exitFullscreen();
      setFullView(false);
    }
  };

  const handlePlay = () => {
    setPlaying(true);
    setError(null);
  };

  const handleError = (e) => {
    setError('视频加载失败，请检查链接是否有效');
    setPlaying(false);
  };

  if (!url) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl">
        <p className="text-gray-400">请输入视频链接</p>
      </div>
    );
  }

  return (
    <div 
      ref={playerElement}
      className={`relative rounded-xl overflow-hidden shadow-card ${fullView ? 'fixed inset-0 z-50 bg-black' : ''}`}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video bg-black"
        controls
        playsInline
        onPlay={handlePlay}
        onError={handleError}
        onEnded={() => setPlaying(false)}
      >
        <source src={url} />
        您的浏览器不支持视频播放
      </video>
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-red-400 text-center px-4">{error}</p>
        </div>
      )}
      
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={toggleFullScreen}
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
          title={fullView ? '退出全屏' : '全屏播放'}
        >
          {fullView ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 5M4 4h5m0 0v5M4 4v5m16-5l5 5m0 0l-5 5m5-5h-5m0 0v5m0-5h-5m5 0l-5-5m0 0l5 5m-5-5v5m0-5h5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>
      
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}
    </div>
  );
}