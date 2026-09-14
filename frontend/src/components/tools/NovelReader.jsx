import { useState } from 'react';
export default function NovelReader() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');

  const themes = {
    light: { bg: 'bg-white', text: 'text-gray-800', line: 'border-gray-100' },
    sepia: { bg: 'bg-amber-50', text: 'text-amber-900', line: 'border-amber-100' },
    dark: { bg: 'bg-gray-900', text: 'text-gray-200', line: 'border-gray-700' },
  };

  const t = themes[theme];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="粘贴小说链接或输入内容..." className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm" />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium">加载</button>
      </div>

      <div className="flex gap-3 items-center justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">字号</span>
          <input type="range" min="12" max="24" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-20 h-1" />
          <span className="text-xs text-gray-500">{fontSize}px</span>
        </div>
        <div className="flex gap-1">
          {Object.entries(themes).map(([id, th]) => (
            <button key={id} onClick={() => setTheme(id)} className={`w-8 h-8 rounded-full border-2 ${id === 'light' ? 'bg-white' : id === 'sepia' ? 'bg-amber-100' : 'bg-gray-800'} ${theme === id ? 'border-blue-500' : 'border-gray-300'}`} />
          ))}
        </div>
      </div>

      <div className={`${t.bg} ${t.text} rounded-xl p-6 min-h-96 max-h-96 overflow-auto font-serif leading-relaxed`} style={{ fontSize }}>
        {content ? content.split('\n').map((p, i) => p && <p key={i} className="mb-3">{p}</p>) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📖</div>
            <p>粘贴小说链接或文本开始阅读</p>
            <p className="text-xs mt-2">支持直接粘贴TXT内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
