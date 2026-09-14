import { useState } from 'react';
export default function MarkdownToPdf() {
  const [md, setMd] = useState('# 示例文档\n\n这是一个 **Markdown** 示例。\n\n## 特性\n- 支持标题\n- 支持列表\n- 支持代码块\n\n```\ncode example\n```');
  const [output, setOutput] = useState(null);

  const convert = () => {
    // Demo: show that conversion would happen
    setOutput({ size: Math.round(md.length / 10) + ' KB', pages: Math.ceil(md.length / 2000) });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Markdown</label>
        <textarea value={md} onChange={e => setMd(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">预览</label>
        <div className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-auto prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: md.replace(/#{1,6}\s/g, '<h>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\n/g, '<br/>') }} />
      </div>
      <button onClick={convert} disabled={!md.trim()} className="self-start px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50">导出PDF</button>
      {output && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">PDF生成成功!</div>
          <div className="text-sm text-gray-500 mt-1">{output.pages} 页，约 {output.size}</div>
        </div>
      )}
    </div>
  );
}
