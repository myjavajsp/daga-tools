import { useState } from 'react';
export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const decodeJwt = (jwt) => {
    try {
      setError('');
      const parts = jwt.split('.');
      if (parts.length !== 3) throw new Error('无效的JWT格式');
      
      const headerJson = atob(parts[0]);
      const payloadJson = atob(parts[1]);
      
      setHeader(JSON.parse(headerJson));
      setPayload(JSON.parse(payloadJson));
    } catch (e) {
      setError('解码失败: ' + e.message);
      setHeader(null);
      setPayload(null);
    }
  };

  const copyJson = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExpInfo = (exp) => {
    if (!exp) return null;
    const now = Date.now() / 1000;
    const remaining = exp - now;
    if (remaining <= 0) return { text: '已过期', color: 'text-red-500' };
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    return { text: `${days}天${hours}小时`, color: 'text-green-500' };
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="粘贴JWT token..."
          className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-mono text-xs"
        />
      </div>

      <button
        onClick={() => decodeJwt(token)}
        disabled={!token.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        解码
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {header && payload && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Header</h3>
              <button onClick={() => copyJson(header)} className="text-xs text-blue-500 hover:text-blue-600">
                {copied ? '已复制!' : '复制'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-48">
              {JSON.stringify(header, null, 2)}
            </pre>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Payload</h3>
              <button onClick={() => copyJson(payload)} className="text-xs text-blue-500 hover:text-blue-600">
                {copied ? '已复制!' : '复制'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-48">
              {JSON.stringify(payload, null, 2)}
            </pre>
            {(payload.exp || payload.nbf) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-sm">
                {payload.exp && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">过期时间</span>
                    <span className={`font-medium ${getExpInfo(payload.exp).color}`}>{getExpInfo(payload.exp).text}</span>
                  </div>
                )}
                {payload.nbf && (
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600 dark:text-gray-400">生效时间</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(payload.nbf * 1000).toLocaleString('zh-CN')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
