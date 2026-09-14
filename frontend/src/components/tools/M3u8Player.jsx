import { useState, useRef } from 'react';
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
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <button onClick={play} disabled={!url.trim()} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">
          播放
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          style={{ display: url ? 'block' : 'none' }}
        >
          您的浏览器不支持视频播放
        </video>
        {!url && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p>输入M3U8链接开始播放</p>
              <p className="text-xs text-gray-400 mt-2">支持 http:// 和 https:// 开头地址</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">使用说明</div>
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
