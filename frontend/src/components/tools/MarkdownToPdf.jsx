import { useState } from 'react';
import { marked } from 'marked';
import { fmtSize, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

/** 打印样式：走浏览器「打印 → 另存为 PDF」，中文与排版由浏览器原生渲染，无字体嵌入问题 */
const PRINT_CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", system-ui, sans-serif;
         color: #1f2328; font-size: 12pt; line-height: 1.75; }
  h1,h2,h3,h4,h5,h6 { font-weight: 700; line-height: 1.3; margin: 1.2em 0 .5em; }
  h1 { font-size: 22pt; border-bottom: 2px solid #eaeef2; padding-bottom: .3em; }
  h2 { font-size: 17pt; border-bottom: 1px solid #eaeef2; padding-bottom: .25em; }
  h3 { font-size: 14pt; }
  p { margin: .6em 0; }
  ul,ol { padding-left: 1.6em; margin: .6em 0; }
  li { margin: .25em 0; }
  code { background:#f2f4f7; padding:.12em .4em; border-radius:4px; font-size:.9em; }
  pre { background:#f6f8fa; padding:.8em 1em; border-radius:8px; overflow:auto; }
  pre code { background:none; padding:0; }
  blockquote { margin:.8em 0; padding:.4em 1em; border-left:4px solid #d0d7de; color:#57606a; }
  table { border-collapse:collapse; width:100%; margin:.8em 0; }
  th,td { border:1px solid #d0d7de; padding:.4em .6em; text-align:left; }
  th { background:#f6f8fa; }
  img { max-width:100%; }
  a { color:#0969da; text-decoration:none; }
`;

export default function MarkdownToPdf() {
  const [md, setMd] = useState(
    '# 示例文档\n\n这是一个 **Markdown** 示例。\n\n## 特性\n- 支持标题\n- 支持列表\n- 支持代码块\n\n```\ncode example\n```'
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const html = (() => {
    try {
      return marked.parse(md);
    } catch {
      return '<p style="color:#c00">Markdown 解析出错</p>';
    }
  })();

  const exportPdf = async () => {
    if (!md.trim()) return;
    setBusy(true);
    setError('');
    setResult(null);
    let iframe = null;
    try {
      iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.cssText =
        'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error('无法创建打印上下文');
      doc.open();
      doc.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeName('导出')}</title><style>${PRINT_CSS}</style></head><body>${html}</body></html>`
      );
      doc.close();

      // 等一帧确保内容就绪再打印
      await new Promise((r) => setTimeout(r, 400));
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setResult({ ok: true, size: new Blob([md]).size });
    } catch (err) {
      setError(err?.message || '导出失败');
    } finally {
      if (iframe) setTimeout(() => iframe.remove(), 1500);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Markdown</label>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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

      <button onClick={exportPdf} disabled={!md.trim() || busy} className={BTN_PRIMARY}>
        {busy ? '正在唤起打印…' : '导出PDF'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="text-green-700 dark:text-green-400 font-medium text-center">已唤起打印窗口</div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            在打印窗口中选择目标为「另存为 PDF」即可保存。中文由浏览器原生渲染，不会出现乱码或方块字。
          </p>
        </div>
      )}
    </div>
  );
}
