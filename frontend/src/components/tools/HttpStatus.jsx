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
    if (code < 200) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (code < 300) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (code < 400) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    if (code < 500) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索状态码..."
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />

      <div className="grid gap-2 max-h-96 overflow-auto">
        {filtered.map(s => (
          <button
            key={s.code}
            onClick={() => setSelected(s)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:shadow-md transition-all ${
              selected?.code === s.code ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <span className={`px-3 py-1 rounded-lg font-mono font-bold text-sm ${getGroupColor(s.code)}`}>
              {s.code}
            </span>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white text-sm">{s.text}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl font-mono font-bold text-lg ${getGroupColor(selected.code)}`}>
              {selected.code}
            </span>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{selected.text}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{selected.desc}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
          { label: '信息', range: '1xx', color: 'bg-blue-500' },
          { label: '成功', range: '2xx', color: 'bg-green-500' },
          { label: '重定向', range: '3xx', color: 'bg-yellow-500' },
          { label: '客户端错误', range: '4xx', color: 'bg-orange-500' },
          { label: '服务器错误', range: '5xx', color: 'bg-red-500' },
        ].map(({ label, range, color }) => (
          <div key={range} className={`px-2 py-2 rounded-lg text-white ${color}`}>{label}</div>
        ))}
      </div>
    </div>
  );
}
