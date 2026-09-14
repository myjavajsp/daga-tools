import { useState } from 'react';
export default function IpLookup() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!ip) return;
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();
      if (data.error) throw new Error(data.reason || 'Invalid IP');
      setResult(data);
      setError('');
    } catch (e) {
      setResult(null);
      setError(e.message);
    }
  };

  const checkMyIp = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      setIp(data.ip);
      setResult(data);
    } catch (e) {
      setError('获取失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="输入IP地址..."
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
        />
        <button onClick={lookup} disabled={!ip} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">
          查询
        </button>
      </div>
      <button onClick={checkMyIp} className="text-sm text-blue-500 hover:text-blue-600">查看我的IP</button>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">🌍</div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white font-mono text-lg">{result.ip}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{result.country_name || 'Unknown'}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: '国家', value: result.country_name || '-' },
              { label: '地区', value: result.region || '-' },
              { label: '城市', value: result.city || '-' },
              { label: '邮编', value: result.postal || '-' },
              { label: '时区', value: result.timezone || '-' },
              { label: '运营商', value: result.org || '-' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-gray-500 dark:text-gray-400 text-xs">{label}</div>
                <div className="font-medium text-gray-900 dark:text-white">{value}</div>
              </div>
            ))}
          </div>
          {result.latitude && result.longitude && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">坐标</div>
              <code className="font-mono text-gray-700 dark:text-gray-300">{result.latitude}, {result.longitude}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
