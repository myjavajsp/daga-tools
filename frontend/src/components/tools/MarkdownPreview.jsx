import { useState, useMemo } from 'react';
import { marked } from 'marked';
export default function MarkdownPreview() {
  const [md, setMd] = useState('# Markdown 预览\n\n这是一个 **示例** 文档。\n\n- 列表项 1\n- 列表项 2\n\n```\ncode block\n```\n\n[链接](https://example.com)');
  const html = useMemo(() => marked.parse(md), [md]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Markdown</label>
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">预览</label>
        <div
          className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-auto prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
