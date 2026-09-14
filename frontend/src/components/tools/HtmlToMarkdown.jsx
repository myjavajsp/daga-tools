import { useState } from 'react';
export default function HtmlToMarkdown() {
  const [html, setHtml] = useState('<h1>标题</h1>\n<p>这是段落文字。</p>\n<ul><li>列表项1</li><li>列表项2</li></ul>\n<p><strong>粗体</strong> 和 <em>斜体</em></p>\n<a href="https://example.com">链接</a>');
  const [md, setMd] = useState('');

  const convert = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let result = '';
    doc.body.childNodes.forEach(node => {
      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'h1') result += '# ' + node.textContent + '\n\n';
        else if (tag === 'h2') result += '## ' + node.textContent + '\n\n';
        else if (tag === 'h3') result += '### ' + node.textContent + '\n\n';
        else if (tag === 'p') result += node.textContent + '\n\n';
        else if (tag === 'br') result += '\n';
        else if (tag === 'strong' || tag === 'b') result += '**' + node.textContent + '**';
        else if (tag === 'em' || tag === 'i') result += '*' + node.textContent + '*';
        else if (tag === 'a') result += '[' + node.textContent + '](' + node.getAttribute('href') + ')';
        else if (tag === 'ul' || tag === 'ol') {
          Array.from(node.children).forEach(li => {
            result += '- ' + li.textContent + '\n';
          });
          result += '\n';
        }
        else if (tag === 'code') result += '`' + node.textContent + '`';
        else if (tag === 'pre') result += '```\n' + node.textContent + '\n```\n\n';
        else if (tag === 'blockquote') result += '> ' + node.textContent + '\n\n';
        else if (tag === 'hr') result += '---\n\n';
        else result += node.textContent;
      } else if (node.nodeType === 3 && node.textContent.trim()) {
        result += node.textContent;
      }
    });
    setMd(result.trim());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HTML</label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Markdown</label>
        <textarea
          value={md}
          readOnly
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none font-mono text-sm focus:outline-none"
        />
      </div>
      <button
        onClick={convert}
        className="self-start px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
      >
        转换
      </button>
    </div>
  );
}
