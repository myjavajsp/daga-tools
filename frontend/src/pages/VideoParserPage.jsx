import { useState } from 'react';
import MediaPlayerTool from '../components/MediaPlayerTool';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function VideoParserPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleParse = async () => {
    if (!url.trim()) {
      setError('请输入视频链接');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setTimeout(() => {
        setResult({
          title: '解析成功',
          playUrl: url,
          qualities: [
            { quality: '高清', url: url },
            { quality: '标清', url: url }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('解析出错，请稍后重试');
      setLoading(false);
    }
  };

  const handlePlay = (playUrl) => {
    setResult({ ...result, playUrl });
  };

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
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3">支持多种视频格式，免费在线解析播放</p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                placeholder="粘贴视频链接..."
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
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>解析中...</span>
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
        </div>

        {/* Player Section */}
        {result && result.playUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
            <MediaPlayerTool 
              url={result.playUrl} 
              title={result.title || '视频播放'} 
            />
            
            {result.qualities && result.qualities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {result.qualities.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handlePlay(q.url)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      result.playUrl === q.url
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {q.quality || '默认'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supported Formats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">支持的格式</h3>
          <div className="flex flex-wrap gap-2">
            {['MP4', 'MKV', 'AVI', 'MOV', 'WMV', 'FLV', 'M3U8'].map((format) => (
              <span
                key={format}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
