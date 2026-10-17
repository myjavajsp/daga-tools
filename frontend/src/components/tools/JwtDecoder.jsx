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
    if (remaining <= 0) return { text: '已过期', color: 'text-danger' };
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    return { text: `${days}天${hours}小时`, color: 'text-success' };
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="粘贴JWT token..."
          className="w-full h-24 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft resize-none font-mono text-xs"
        />
      </div>

      <button
        onClick={() => decodeJwt(token)}
        disabled={!token.trim()}
        className="btn-a w-full transition-colors"
      >
        解码
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {header && payload && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink-2">Header</h3>
              <button onClick={() => copyJson(header)} className="act">
                {copied ? '已复制!' : '复制'}
              </button>
            </div>
            <pre className="p-4 bg-paper rounded-card text-xs font-mono text-ink overflow-auto max-h-48">
              {JSON.stringify(header, null, 2)}
            </pre>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink-2">Payload</h3>
              <button onClick={() => copyJson(payload)} className="act">
                {copied ? '已复制!' : '复制'}
              </button>
            </div>
            <pre className="p-4 bg-paper rounded-card text-xs font-mono text-ink overflow-auto max-h-48">
              {JSON.stringify(payload, null, 2)}
            </pre>
            {(payload.exp || payload.nbf) && (
              <div className="bg-accent-soft border border-line rounded-card p-3 text-sm">
                {payload.exp && (
                  <div className="flex justify-between">
                    <span className="text-ink-2">过期时间</span>
                    <span className={`font-medium ${getExpInfo(payload.exp).color}`}>{getExpInfo(payload.exp).text}</span>
                  </div>
                )}
                {payload.nbf && (
                  <div className="flex justify-between mt-1">
                    <span className="text-ink-2">生效时间</span>
                    <span className="font-medium text-ink-2">{new Date(payload.nbf * 1000).toLocaleString('zh-CN')}</span>
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
