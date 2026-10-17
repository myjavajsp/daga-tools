/** 格式化字节数 */
export function fmtSize(bytes) {
  const b = Number(bytes || 0);
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 * 1024 * 1024) return (b / 1024 / 1024).toFixed(2) + ' MB';
  return (b / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

/** 触发浏览器下载 Blob / File */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 延迟释放，确保下载已被浏览器接管
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** File -> ArrayBuffer */
export function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error || new Error('文件读取失败'));
    fr.readAsArrayBuffer(file);
  });
}

/** File -> DataURL */
export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error || new Error('文件读取失败'));
    fr.readAsDataURL(file);
  });
}

/** 去掉扩展名 */
export function stripExt(name) {
  return String(name || '').replace(/\.[^.]+$/, '');
}

/** 安全文件名（去非法字符、限长） */
export function safeName(s) {
  return (
    String(s || '')
      .replace(/[\\/:*?"<>|\r\n\t]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40) || 'file'
  );
}

/** 通过 URL 加载图片为 HTMLImageElement（带 CORS） */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

/** 统一的结果下载按钮类名。
 *  以前这里手抄一份内联材质（py-3 / rounded-card / disabled:opacity-50），
 *  和 src/index.css 的 .btn-a 是两套东西：圆角 12 vs 9、禁用透明度 50 vs 45，
 *  同一页并排出现就能看出按钮不一样。现在直接引用设计系统类，
 *  hover 压深、禁用态、字号字重全部由 .btn-a 负责。 */
export const BTN_PRIMARY = 'btn-a w-full';
