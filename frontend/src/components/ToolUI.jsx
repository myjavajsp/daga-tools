import Icon from './Icons';

/**
 * 内页工具共用的三件套。
 *
 * 这些形状在 40+ 个 tools/* 里各抄了一份，并且各自漂移（同一种空状态有
 * text-3xl / text-4xl / text-6xl 三种字号、圆角有 xl / 2xl 两种）。
 * 统一到一个地方，样式只改一次。图标一律走 Icons.jsx 的线性图标 —— 
 * 旧写法是塞一个 emoji 当图标，那是「AI 味」的主要来源。
 */

/** 上传/拖拽区：唯一的入口样式，点击即触发隐藏的 file input */
export function Dropzone({ id, accept, multiple, onChange, icon = 'upload', title, hint, preview }) {
  return (
    <div
      onClick={() => document.getElementById(id)?.click()}
      className="border border-dashed border-line-2 rounded-card p-6 text-center hover:border-accent transition-colors cursor-pointer"
    >
      <input id={id} type="file" accept={accept} multiple={multiple} onChange={onChange} className="hidden" />
      {/* .chip 是 display:grid，块级元素不会被父级的 text-center 居中，必须再包一层 flex */}
      <div className="flex justify-center mb-3"><span className="chip"><Icon name={icon} /></span></div>
      <p className="text-sm text-ink-2">{title}</p>
      {hint && <p className="text-xs text-ink-3 mt-1">{hint}</p>}
      {preview}
    </div>
  );
}

/** 空状态：图标芯片 + 一句主文案 + 一句辅助说明 */
export function EmptyState({ icon = 'file', title, note }) {
  return (
    <div className="text-center py-10">
      <div className="flex justify-center mb-3"><span className="chip"><Icon name={icon} /></span></div>
      <p className="text-sm text-ink-2">{title}</p>
      {note && <p className="text-xs text-ink-3 mt-1.5">{note}</p>}
    </div>
  );
}

/** 「功能说明 / 使用提示」这类小版块标题：旧写法是在标题前塞一个 💡 */
export function NoteBlock({ title = '说明', children }) {
  return (
    <div className="bg-surface-2 rounded-card p-4">
      <div className="flex items-center gap-2 font-medium text-ink mb-2 text-sm">
        <Icon name="bulb" /><span>{title}</span>
      </div>
      <div className="text-sm text-ink-2 leading-relaxed">{children}</div>
    </div>
  );
}
