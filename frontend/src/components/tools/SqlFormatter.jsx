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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SQL语句</label>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>
      <button
        onClick={handleFormat}
        disabled={!sql.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        格式化
      </button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">格式化结果</label>
            <button onClick={copyOutput} className={`text-xs px-3 py-1 rounded-lg transition-colors ${copied?'bg-green-100 dark:bg-green-900/30 text-green-600':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
          <pre className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto max-h-64">{output}</pre>
        </div>
      )}
    </div>
  );
}
