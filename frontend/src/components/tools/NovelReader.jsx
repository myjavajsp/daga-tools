import { useState } from 'react';
import Icon from '../Icons';
export default function NovelReader() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');

  /* 这三张「纸」是阅读器给用户的选项数据，不参与全站换肤：
     所以它们保留各自的原始色值（sepia 的琥珀、dark 的近黑），
     但边框必须用同一档发丝线，否则切到 dark 时边框会和正文糊成一片。 */
  const themes = {
    light: { bg: 'bg-surface', text: 'text-ink', line: 'border-line' },
    sepia: { bg: 'bg-amber-50', text: 'text-amber-900', line: 'border-amber-100' },
    dark: { bg: 'bg-gray-900', text: 'text-gray-200', line: 'border-line-2' },
  };

  const t = themes[theme];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="粘贴小说链接或输入内容..." className="flex-1 px-4 py-2 bg-paper border border-line rounded-card text-ink text-sm" />
        <button className="btn-a px-4 text-sm transition-colors">加载</button>
      </div>

      <div className="flex gap-3 items-center justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-3">字号</span>
          <input type="range" min="12" max="24" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="slider w-20" />
          <span className="text-xs text-ink-3">{fontSize}px</span>
        </div>
        <div className="flex gap-1">
          {Object.entries(themes).map(([id, th]) => (
            <button key={id} onClick={() => setTheme(id)} aria-label={`阅读主题：${id}`} className={`w-8 h-8 rounded-full border-2 ${id === 'light' ? 'bg-surface' : id === 'sepia' ? 'bg-amber-100' : 'bg-gray-800'} ${theme === id ? 'border-accent' : 'border-line-2'}`} />
          ))}
        </div>
      </div>

      <div className={`${t.bg} ${t.text} rounded-card p-6 min-h-96 max-h-96 overflow-auto font-serif leading-relaxed`} style={{ fontSize }}>
        {content ? content.split('\n').map((p, i) => p && <p key={i} className="mb-3">{p}</p>) : (
          <div className="text-center py-12 text-ink-3">
            <div className="flex justify-center mb-3"><span className="chip"><Icon name="file" /></span></div>
            <p>粘贴小说链接或文本开始阅读</p>
            <p className="text-xs mt-2">支持直接粘贴TXT内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
