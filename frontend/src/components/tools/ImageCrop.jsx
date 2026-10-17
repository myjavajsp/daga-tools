import { useState, useRef } from 'react';
import Icon from '../Icons';
export default function ImageCrop() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [aspectRatio, setAspectRatio] = useState(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  const ratios = [
    { label: '自由', value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4/3 },
    { label: '16:9', value: 16/9 },
    { label: '3:4', value: 3/4 },
    { label: '9:16', value: 9/16 },
  ];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setCrop({ x: 10, y: 10, w: img.width - 20, h: img.height - 20 });
        setPreview(ev.target.result);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const cropImage = () => {
    if (!image) return;
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;
    
    const canvas = document.createElement('canvas');
    canvas.width = crop.w;
    canvas.height = crop.h;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      crop.x * scaleX, crop.y * scaleY,
      crop.w * scaleX, crop.h * scaleY,
      0, 0,
      crop.w, crop.h
    );
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cropped.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - crop.x, y: e.clientY - crop.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(rect.width - prev.w, e.clientX - rect.left - dragStart.current.x)),
      y: Math.max(0, Math.min(rect.height - prev.h, e.clientY - rect.top - dragStart.current.y)),
    }));
  };

  const handleMouseUp = () => { isDragging.current = false; };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="scissors" /></span></div>
        <p className="text-ink-2">{preview ? '点击更换图片' : '点击上传图片'}</p>
      </div>

      {preview && image && (
        <>
          <div className="flex gap-2 flex-wrap">
            {ratios.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => {
                  setAspectRatio(value);
                  if (value) {
                    const h = crop.w / value;
                    setCrop(prev => ({ ...prev, h: Math.min(h, image.naturalHeight * 0.8) }));
                  }
                }}
                className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${
                  aspectRatio === value ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative inline-block max-w-full" ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <img src={preview} alt="Crop" className="max-w-full max-h-96 rounded-card" style={{ display: 'block' }} />
            <div
              className="absolute border-2 border-accent cursor-move"
              style={{
                left: crop.x, top: crop.y,
                width: crop.w, height: crop.h,
              }}
            >
              <div className="absolute inset-0 border-dashed border-white/50" style={{ backgroundImage: 'linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.3) 48%, rgba(255,255,255,0.3) 52%, transparent 52%)', backgroundSize: '10px 10px' }}></div>
              <div className="absolute -top-6 left-0 text-xs text-accent font-mono">
                {Math.round(crop.w)} x {Math.round(crop.h)}
              </div>
            </div>
          </div>

          <button
            onClick={cropImage}
            className="btn-a w-full transition-colors"
          >
            裁剪并下载
          </button>
        </>
      )}
    </div>
  );
}
