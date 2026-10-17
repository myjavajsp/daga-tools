import { useState, useMemo } from 'react';
import { marked } from 'marked';
export default function MarkdownPreview() {
  const [md, setMd] = useState('# Markdown 预览\n\n这是一个 **示例** 文档。\n\n- 列表项 1\n- 列表项 2\n\n```\ncode block\n```\n\n[链接](https://example.com)');
  const html = useMemo(() => marked.parse(md), [md]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      <div className="flex flex-col">
        <label className="lbl">Markdown</label>
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          className="input mono min-h-56 resize-none"
        />
      </div>
      <div className="flex flex-col">
        <label className="lbl">预览</label>
        <div
          className="card article overflow-auto p-4 min-h-56"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
