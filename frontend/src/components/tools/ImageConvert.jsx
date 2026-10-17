import { useState, useRef } from 'react';
import Icon from '../Icons';
export default function ImageConvert() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const formats = [
    { value: 'image/jpeg', label: 'JPG', mime: 'image/jpeg' },
    { value: 'image/png', label: 'PNG', mime: 'image/png' },
    { value: 'image/webp', label: 'WebP', mime: 'image/webp' },
    { value: 'image/bmp', label: 'BMP', mime: 'image/bmp' },
  ];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const convert = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (format === 'image/jpeg' || format === 'image/bmp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          setResult({
            blob,
            url: URL.createObjectURL(blob),
            size: blob.size,
            format: format.split('/')[1].toUpperCase(),
          });
          setLoading(false);
        }, format, quality / 100);
      };
      img.src = URL.createObjectURL(image);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `converted.${result.format.toLowerCase()}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="image" /></span></div>
        <p className="text-ink-2">{preview ? '点击更换图片' : '点击或拖拽上传图片'}</p>
        <p className="text-xs text-ink-3 mt-1">支持 JPG、PNG、WebP、BMP</p>
      </div>

      {preview && (
        <>
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-card" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="lbl">目标格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="input w-full"
              >
                {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">
                质量: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="slider mt-3"
              />
            </div>
          </div>

          <button
            onClick={convert}
            disabled={loading}
            className="btn-a w-full transition-colors"
          >
            {loading ? '转换中...' : '开始转换'}
          </button>

          {result && (
            <div className="bg-success-soft border border-line rounded-card p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-3">原文件</span>
                <span className="font-medium text-ink">{(image.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-3">转换后</span>
                <span className="font-medium text-success">{(result.size / 1024).toFixed(1)} KB ({result.format})</span>
              </div>
              <button
                onClick={download}
                className="btn-a ok w-full transition-colors"
              >
                下载转换后的图片
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
