import { useState } from 'react';
const STATUS_CODES = [
  { code: 100, text: 'Continue', desc: '继续请求' },
  { code: 101, text: 'Switching Protocols', desc: '切换协议' },
  { code: 200, text: 'OK', desc: '请求成功' },
  { code: 201, text: 'Created', desc: '已创建' },
  { code: 202, text: 'Accepted', desc: '已接受' },
  { code: 204, text: 'No Content', desc: '无内容' },
  { code: 301, text: 'Moved Permanently', desc: '永久重定向' },
  { code: 302, text: 'Found', desc: '临时重定向' },
  { code: 304, text: 'Not Modified', desc: '未修改' },
  { code: 400, text: 'Bad Request', desc: '请求错误' },
  { code: 401, text: 'Unauthorized', desc: '未授权' },
  { code: 403, text: 'Forbidden', desc: '禁止访问' },
  { code: 404, text: 'Not Found', desc: '未找到' },
  { code: 405, text: 'Method Not Allowed', desc: '方法不允许' },
  { code: 429, text: 'Too Many Requests', desc: '请求过于频繁' },
  { code: 500, text: 'Internal Server Error', desc: '服务器内部错误' },
  { code: 502, text: 'Bad Gateway', desc: '网关错误' },
  { code: 503, text: 'Service Unavailable', desc: '服务不可用' },
  { code: 504, text: 'Gateway Timeout', desc: '网关超时' },
];

export default function HttpStatus() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = STATUS_CODES.filter(s =>
    s.code.toString().includes(search) ||
    s.text.toLowerCase().includes(search.toLowerCase()) ||
    s.desc.includes(search)
  );

  const getGroupColor = (code) => {
    if (code < 200) return 'bg-accent-soft text-accent';
    if (code < 300) return 'bg-success-soft text-success';
    if (code < 400) return 'bg-warning-soft text-warning';
    if (code < 500) return 'bg-warning-soft text-warning';
    return 'bg-danger-soft text-danger';
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索状态码..."
        className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft"
      />

      <div className="grid gap-2 max-h-96 overflow-auto">
        {filtered.map(s => (
          <button
            key={s.code}
            onClick={() => setSelected(s)}
            className={`flex items-center gap-4 px-4 py-3 rounded-card text-left hover:shadow-md transition-all ${
              selected?.code === s.code ? 'ring-2 ring-accent-soft' : ''
            }`}
          >
            <span className={`px-3 py-1 rounded-lg font-mono font-bold text-sm ${getGroupColor(s.code)}`}>
              {s.code}
            </span>
            <div className="flex-1">
              <div className="font-medium text-ink text-sm">{s.text}</div>
              <div className="text-xs text-ink-3">{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-paper rounded-card p-4 space-y-2">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-card font-mono font-bold text-lg ${getGroupColor(selected.code)}`}>
              {selected.code}
            </span>
            <div>
              <div className="font-bold text-ink">{selected.text}</div>
              <div className="text-sm text-ink-3">{selected.desc}</div>
            </div>
          </div>
          <p className="text-sm text-ink-2">
            {selected.code >= 200 && selected.code < 300 ? '表示请求已成功处理。' :
             selected.code >= 300 && selected.code < 400 ? '表示需要进一步操作以完成请求。' :
             selected.code >= 400 && selected.code < 500 ? '表示客户端请求有误。' :
             selected.code >= 500 ? '表示服务器处理请求时发生错误。' :
             ' informational 信息类响应。'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 text-xs text-center">
        {[
          { label: '信息', range: '1xx', color: 'bg-accent' },
          { label: '成功', range: '2xx', color: 'bg-success' },
          { label: '重定向', range: '3xx', color: 'bg-warning' },
          { label: '客户端错误', range: '4xx', color: 'bg-warning' },
          { label: '服务器错误', range: '5xx', color: 'bg-danger' },
        ].map(({ label, range, color }) => (
          <div key={range} className={`px-2 py-2 rounded-lg text-accent-fg ${color}`}>{label}</div>
        ))}
      </div>
    </div>
  );
}
