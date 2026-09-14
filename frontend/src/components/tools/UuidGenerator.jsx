import { useState } from 'react';
export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const list = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids(list);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">生成数量</label>
        <input
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <button
        onClick={generate}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        生成 UUID
      </button>

      {uuids.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">共 {uuids.length} 个 UUID</span>
            <button
              onClick={copyAll}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${copied ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
            >
              {copied ? '已复制!' : '复制全部'}
            </button>
          </div>
          <div className="space-y-1 max-h-80 overflow-auto">
            {uuids.map((uuid, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-400 w-6">{i + 1}.</span>
                <code className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300">{uuid}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(uuid); }}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">关于 UUID</div>
        <p className="text-xs">UUID v4 是由随机数生成的通用唯一标识符，格式为 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx，其中 y 为 8、9、a 或 b。</p>
      </div>
    </div>
  );
}
