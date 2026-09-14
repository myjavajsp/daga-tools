import { useState, useRef } from 'react';

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

  useState(() => {
    updateStats('');
  });

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
          className="w-full h-64 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none"
        />
        {text && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-lg transition-colors"
          >
            清空
          </button>
        )}
      </div>

      {/* 统计结果 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.chars}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">总字符数</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.charsNoSpace}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">不含空格</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.cnChars}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">中文字符</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.words}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">单词数</div>
        </div>
        <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.lines}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">行数</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.paragraphs}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">段落数</div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
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
