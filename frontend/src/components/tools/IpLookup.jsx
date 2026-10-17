import { useState } from 'react';
import Icon from '../Icons';
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
          className="flex-1 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft font-mono"
        />
        <button onClick={lookup} disabled={!ip} className="btn-a px-6">
          查询
        </button>
      </div>
      <button onClick={checkMyIp} className="act">查看我的IP</button>

      {error && <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">{error}</div>}

      {result && (
        <div className="bg-paper rounded-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="chip"><Icon name="globe" /></span>
            <div>
              <div className="font-bold text-ink font-mono text-lg">{result.ip}</div>
              <div className="text-xs text-ink-3">{result.country_name || 'Unknown'}</div>
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
              <div key={label} className="bg-surface rounded-lg p-3">
                <div className="text-ink-3 text-xs">{label}</div>
                <div className="font-medium text-ink">{value}</div>
              </div>
            ))}
          </div>
          {result.latitude && result.longitude && (
            <div className="bg-surface rounded-lg p-3 text-sm">
              <div className="text-ink-3 text-xs mb-1">坐标</div>
              <code className="font-mono text-ink-2">{result.latitude}, {result.longitude}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
