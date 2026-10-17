import { useState } from 'react';
export default function SqlFormatter() {
  const [sql, setSql] = useState('select id,name,age from users where age>18 and status=1 order by id desc limit 10');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const format = (s) => {
    const keywords = ['SELECT','FROM','WHERE','AND','OR','ORDER BY','GROUP BY','HAVING','LIMIT','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','ON','UNION','ALL','AS','IN','NOT','NULL','IS','CASE','WHEN','THEN','ELSE','END','CREATE TABLE','INDEX','ALTER','DROP'];
    let result = s;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw.replace(/\s/g, '\\s')}\\b`, 'gi');
      result = result.replace(regex, '\n' + kw);
    });
    result = result.replace(/\n\s+/g, '\n');
    result = result.replace(/\s+/g, ' ');
    return result.trim().replace(/\n/g, '\n  ');
  };

  const handleFormat = () => {
    setOutput(format(sql));
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="lbl">SQL语句</label>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          className="w-full h-40 px-4 py-3 bg-paper border border-line rounded-card text-ink font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>
      <button
        onClick={handleFormat}
        disabled={!sql.trim()}
        className="btn-a w-full transition-colors"
      >
        格式化
      </button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lbl">格式化结果</label>
            <button onClick={copyOutput} className={`text-xs px-3 py-1 rounded-lg transition-colors ${copied?'bg-success-soft text-success':'bg-surface-2 text-ink-2'}`}>
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
          <pre className="p-4 bg-paper rounded-card text-sm font-mono text-ink whitespace-pre-wrap overflow-auto max-h-64">{output}</pre>
        </div>
      )}
    </div>
  );
}
