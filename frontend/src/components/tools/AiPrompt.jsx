import { useState } from 'react';
const LOREM_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'];
export default function AiPrompt() {
  const [output, setOutput] = useState('');

  const generate = () => {
    let text = '';
    for (let i = 0; i < 200; i++) {
      text += LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)] + ' ';
    }
    setOutput(text.trim());
  };

  return (
    <div className="space-y-6">
      <button onClick={generate} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">生成占位文本</button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">生成结果</label>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-blue-500">复制</button>
          </div>
          <textarea value={output} readOnly className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none text-sm" />
        </div>
      )}
    </div>
  );
}
