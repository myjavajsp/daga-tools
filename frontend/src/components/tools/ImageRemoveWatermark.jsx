import { useState, useRef, useEffect } from 'react';
import { fmtSize, downloadBlob, loadImage, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

/**
 * 去水印：框选水印区域后做修复填充。
 *
 * 说明：真正「无痕去除」需要 AI inpainting（如 LaMa 模型）。
 * 这里实现的是传统图像修复——用区域边缘像素做多方向拉伸 + 高斯模糊，
 * 对纯色/渐变背景上的半透明水印效果不错，复杂背景会有痕迹。
 */
function inpaintRect(ctx, w, h, rect) {
  const x = Math.max(0, Math.round(rect.x));
  const y = Math.max(0, Math.round(rect.y));
  const rw = Math.max(1, Math.min(w - x, Math.round(rect.w)));
  const rh = Math.max(1, Math.min(h - y, Math.round(rect.h)));

  // 1) 取区域外圈一圈像素，向外拉伸覆盖（把边缘纹理延伸进水印区）
  const band = 2;
  const region = ctx.getImageData(x, y, rw, rh);
  const src = region.data;

  for (let py = 0; py < rh; py += 1) {
    for (let px = 0; px < rw; px += 1) {
      // 找离当前点最近的区域外像素，直接复制
      const distLeft = px;
      const distRight = rw - 1 - px;
      const distTop = py;
      const distBottom = rh - 1 - py;
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      let sx = px;
      let sy = py;
      if (minDist === distLeft) {
        sx = Math.max(0, px - band);
      } else if (minDist === distRight) {
        sx = Math.min(rw - 1, px + band);
      } else if (minDist === distTop) {
        sy = Math.max(0, py - band);
      } else {
        sy = Math.min(rh - 1, py + band);
      }

      const o = (py * rw + px) * 4;
      const s = (sy * rw + sx) * 4;
      src[o] = src[s];
      src[o + 1] = src[s + 1];
      src[o + 2] = src[s + 2];
    }
  }
  ctx.putImageData(region, x, y);

  // 2) 对修复区做一次轻微高斯模糊，消除拉伸产生的条纹
  const radius = Math.max(1, Math.round(Math.min(rw, rh) * 0.02));
  if (radius > 1) {
    const r2 = ctx.getImageData(x, y, rw, rh);
    ctx.filter = `blur(${radius}px)`;
    ctx.putImageData(r2, x, y);
    ctx.filter = 'none';
  }
}

export default function ImageRemoveWatermark() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [rect, setRect] = useState(null); // {x,y,w,h} 相对图片显示尺寸
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const imgRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\//i.test(f.type)) {
      setError('请上传图片文件');
      return;
    }
    setError('');
    setResult(null);
    setRect(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const pos = (e) => {
    const b = imgRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - b.left, y: cy - b.top };
  };

  const onDown = (e) => {
    e.preventDefault();
    const p = pos(e);
    dragRef.current = p;
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onMove = (e) => {
    if (!dragRef.current) return;
    const p = pos(e);
    const s = dragRef.current;
    setRect({
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    });
  };

  const onUp = () => {
    dragRef.current = null;
  };

  const process = async () => {
    if (!file || !rect || rect.w < 2 || rect.h < 2) return;
    setBusy(true);
    setError('');
    try {
      const el = imgRef.current;
      const sx = el.naturalWidth / el.clientWidth;
      const sy = el.naturalHeight / el.clientHeight;

      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = el.naturalWidth;
      canvas.height = el.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      inpaintRect(ctx, canvas.width, canvas.height, {
        x: rect.x * sx,
        y: rect.y * sy,
        w: rect.w * sx,
        h: rect.h * sy,
      });

      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('图片生成失败'))), 'image/png')
      );
      const name = `${safeName(stripExt(file.name))}-nowm.png`;
      setResult({ name, size: blob.size, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(err?.message || '处理失败');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result?.url) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('wm')?.click()}
      >
        <input id="wm" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">✨</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传带水印的图片'}</p>
        <p className="text-xs text-gray-400 mt-1">上传后在图片上拖拽框选水印区域</p>
      </div>

      {preview && !result && (
        <div
          className="relative inline-block mx-auto select-none touch-none"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        >
          <img ref={imgRef} src={preview} alt="原图" draggable={false} className="max-h-72 rounded-xl block" />
          {rect && rect.w > 1 && rect.h > 1 && (
            <div
              className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
              style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
            />
          )}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">处理完成！</div>
          <div className="text-sm text-gray-500 mt-1">
            {result.name} · {fmtSize(result.size)}
          </div>
          <div className="mt-3 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
            <img src={result.url} alt="去水印结果" className="max-h-48 mx-auto object-contain rounded-lg" />
          </div>
          <button onClick={download} className="mt-3 w-full py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600">
              下载图片
          </button>
        </div>
      )}

      <button onClick={process} disabled={!file || !rect || rect.w < 2 || busy} className={BTN_PRIMARY}>
        {busy ? '处理中…' : '去除水印'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <p className="text-xs text-gray-400">
          当前为传统图像修复（边缘像素延伸 + 模糊）。对纯色/渐变背景上的水印效果较好；复杂背景可能残留痕迹，这类场景需要 AI inpainting 模型。
        </p>
      )}
    </div>
  );
}
