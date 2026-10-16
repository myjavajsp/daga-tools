import { useState } from 'react';
import { fmtSize, downloadBlob, loadImage, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

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
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('us')?.click()}
      >
        <input id="us" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传图片放大'}</p>
      </div>

      {preview && !result && (
        <div className="text-center">
          <img src={preview} alt="原图" className="max-h-48 mx-auto rounded-xl" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">放大倍数</label>
        <div className="flex gap-2">
          {[2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                scale === s ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} />
          锐化处理（放大后边缘更清晰）
        </label>
      </div>

      <button onClick={upscale} disabled={!file || busy} className={BTN_PRIMARY}>
        {busy ? '处理中…' : `放大 ${scale}x`}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">放大完成！已开始下载</div>
          <div className="text-sm text-gray-500 mt-1">
            {result.from} → {result.to} · {fmtSize(result.size)}
          </div>
          <div className="mt-3 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
            <img src={result.url} alt="放大结果" className="max-h-48 mx-auto object-contain rounded-lg" />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            使用浏览器高质量插值 + 锐化。这是传统算法放大，不是 AI 超分，不会凭空生成新细节。
          </p>
        </div>
      )}
    </div>
  );
}
