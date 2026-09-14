import { useState } from 'react';
export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parse = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/video/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      // Demo
      setResult({
        title: '演示视频 - ' + url.substring(0, 30) + '...',
        thumbnail: '',
        formats: [
          { label: '1080P MP4', size: '256MB', url: '#' },
          { label: '720P MP4', size: '128MB', url: '#' },
          { label: '480P MP4', size: '64MB', url: '#' },
          { label: 'MP3 音频', size: '8MB', url: '#' },
        ],
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="粘贴视频链接..." className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
        <button onClick={parse} disabled={!url.trim() || loading} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">解析</button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
          <div className="font-medium text-gray-900 dark:text-white">{result.title}</div>
          <div className="space-y-2">
            {result.formats?.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</span>
                  <span className="text-xs text-gray-400">{f.size}</span>
                </div>
                <a href={f.url} download className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">下载</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
