import { useState, useEffect } from 'react';

import Icon from '../Icons';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    chars: 0,
    charsNoSpace: 0,
    cnChars: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
  });

  useEffect(() => {
    updateStats('');
  }, []);

  const updateStats = (value) => {
    const chars = value.length;
    const charsNoSpace = value.replace(/\s/g, '').length;
    const cnChars = (value.match(/[\u4e00-\u9fa5]/g) || []).length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const lines = value ? value.split('\n').length : 0;
    const paragraphs = value.trim() ? value.split(/\n\n+/).filter(p => p.trim()).length : 0;
    
    setStats({ chars, charsNoSpace, cnChars, words, lines, paragraphs });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);
    updateStats(value);
  };

  const handleClear = () => {
    setText('');
    updateStats('');
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleInputChange}
          placeholder="请输入或粘贴文本内容..."
          className="w-full h-64 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft focus:border-accent resize-none"
        />
        {text && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 px-3 py-1 text-sm text-ink-3 hover:text-ink bg-surface-2 rounded-lg transition-colors"
          >
            清空
          </button>
        )}
      </div>

      {/* 统计结果 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-accent-soft border border-line rounded-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.chars}</div>
          <div className="text-xs text-ink-3 mt-1">总字符数</div>
        </div>
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.charsNoSpace}</div>
          <div className="text-xs text-ink-3 mt-1">不含空格</div>
        </div>
        <div className="bg-accent-soft border border-line rounded-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.cnChars}</div>
          <div className="text-xs text-ink-3 mt-1">中文字符</div>
        </div>
        <div className="bg-warning-soft border border-line rounded-card p-4 text-center">
          <div className="text-2xl font-bold text-warning">{stats.words}</div>
          <div className="text-xs text-ink-3 mt-1">单词数</div>
        </div>
        <div className="bg-accent-soft border border-line rounded-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.lines}</div>
          <div className="text-xs text-ink-3 mt-1">行数</div>
        </div>
        <div className="bg-warning-soft border border-line rounded-card p-4 text-center">
          <div className="text-2xl font-bold text-warning">{stats.paragraphs}</div>
          <div className="text-xs text-ink-3 mt-1">段落数</div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-paper rounded-card p-4 text-sm text-ink-2">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="alert" />
          <span className="font-medium">统计说明</span>
        </div>
        <ul className="space-y-1 text-xs">
          <li>• 总字符数：包含所有字符（中文、英文、数字、标点、空格等）</li>
          <li>• 不含空格：移除所有空白字符后的字符数</li>
          <li>• 中文字符：仅统计汉字数量</li>
          <li>• 单词数：以空格分隔的文本单元数量</li>
        </ul>
      </div>
    </div>
  );
}
