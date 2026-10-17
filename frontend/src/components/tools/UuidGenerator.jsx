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
        <label className="lbl">生成数量</label>
        <input
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-32 px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <button
        onClick={generate}
        className="btn-a w-full transition-colors"
      >
        生成 UUID
      </button>

      {uuids.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-ink-2">共 {uuids.length} 个 UUID</span>
            <button
              onClick={copyAll}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${copied ? 'bg-success-soft text-success' : 'bg-surface-2 text-ink-2 hover:bg-surface-3'}`}
            >
              {copied ? '已复制!' : '复制全部'}
            </button>
          </div>
          <div className="space-y-1 max-h-80 overflow-auto">
            {uuids.map((uuid, i) => (
              <div key={i} className="flex items-center gap-2 bg-paper rounded-lg px-3 py-2">
                <span className="text-xs text-ink-3 w-6">{i + 1}.</span>
                <code className="flex-1 text-sm font-mono text-ink-2">{uuid}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(uuid); }}
                  className="act"
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-paper rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">关于 UUID</div>
        <p className="text-xs">UUID v4 是由随机数生成的通用唯一标识符，格式为 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx，其中 y 为 8、9、a 或 b。</p>
      </div>
    </div>
  );
}
