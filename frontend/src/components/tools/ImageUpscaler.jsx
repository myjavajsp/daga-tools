import { useState } from 'react';
import { fmtSize, downloadBlob, loadImage, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';
import Icon from '../Icons';

/** 3x3 锐化卷积（拉普拉斯型），让放大后的边缘更清晰 */
function applySharpen(ctx, w, h) {
  const id = ctx.getImageData(0, 0, w, h);
  const src = id.data;
  const out = new Uint8ClampedArray(src.length);
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const px = Math.min(w - 1, Math.max(0, x + kx));
          const py = Math.min(h - 1, Math.max(0, y + ky));
          const idx = (py * w + px) * 4;
          const wgt = k[(ky + 1) * 3 + (kx + 1)];
          r += src[idx] * wgt;
          g += src[idx + 1] * wgt;
          b += src[idx + 2] * wgt;
        }
      }
      const o = (y * w + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = src[o + 3];
    }
  }

  id.data.set(out);
  ctx.putImageData(id, 0, 0);
}

export default function ImageUpscaler() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scale, setScale] = useState(2);
  const [sharpen, setSharpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const upscale = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high'; // 浏览器高质量插值
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (sharpen) applySharpen(ctx, canvas.width, canvas.height);

      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('图片生成失败'))), 'image/png')
      );
      const name = `${safeName(stripExt(file.name))}-${scale}x.png`;
      setResult({
        name,
        size: blob.size,
        from: `${img.naturalWidth}×${img.naturalHeight}`,
        to: `${canvas.width}×${canvas.height}`,
        url: URL.createObjectURL(blob),
        blob,
      });
    } catch (err) {
      setError(err?.message || '放大失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('us')?.click()}
      >
        <input id="us" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="search" /></span></div>
        <p className="text-ink-2">{file ? `已选择: ${file.name}` : '上传图片放大'}</p>
      </div>

      {preview && !result && (
        <div className="text-center">
          <img src={preview} alt="原图" className="max-h-48 mx-auto rounded-card" />
        </div>
      )}

      <div>
        <label className="lbl">放大倍数</label>
        <div className="flex gap-2">
          {[2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`flex-1 py-2 rounded-card text-sm font-medium transition-colors ${
                scale === s ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm text-ink-2 min-h-8">
          <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} />
          锐化处理（放大后边缘更清晰）
        </label>
      </div>

      <button onClick={upscale} disabled={!file || busy} className={BTN_PRIMARY}>
        {busy ? '处理中…' : `放大 ${scale}x`}
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">放大完成！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            {result.from} → {result.to} · {fmtSize(result.size)}
          </div>
          <div className="mt-3 bg-surface-2 rounded-lg p-2">
            <img src={result.url} alt="放大结果" className="max-h-48 mx-auto object-contain rounded-lg" />
          </div>
          <p className="text-xs text-ink-3 mt-2">
            使用浏览器高质量插值 + 锐化。这是传统算法放大，不是 AI 超分，不会凭空生成新细节。
          </p>
        </div>
      )}
    </div>
  );
}
