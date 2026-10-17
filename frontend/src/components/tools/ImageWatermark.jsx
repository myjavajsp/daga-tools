import { useState } from 'react';
import Icon from '../Icons';
export default function ImageWatermark() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('水印文字');
  const [size, setSize] = useState(48);
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState('center');
  const [color, setColor] = useState('#ffffff');
  const fileInputRef = useState(null)[1];

  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setPreview(ev.target.result);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const addWatermark = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);
    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = color;
    ctx.font = `${size * 2}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let x = canvas.width / 2, y = canvas.height / 2;
    if (position === 'top-left') { x = canvas.width * 0.15; y = canvas.height * 0.15; }
    else if (position === 'top-right') { x = canvas.width * 0.85; y = canvas.height * 0.15; }
    else if (position === 'bottom-left') { x = canvas.width * 0.15; y = canvas.height * 0.85; }
    else if (position === 'bottom-right') { x = canvas.width * 0.85; y = canvas.height * 0.85; }
    
    ctx.fillText(text, x, y);
    
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watermarked.png';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input id="fileInput" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="droplet" /></span></div>
        <p className="text-ink-2">{preview ? '点击更换图片' : '点击上传图片'}</p>
      </div>

      {preview && (
        <>
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-card" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="lbl">水印文字</label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
              />
            </div>
            <div>
              <label className="lbl">位置</label>
              <div className="grid grid-cols-3 gap-1">
                {positions.map(p => (
                  <button
                    key={p}
                    onClick={() => setPosition(p)}
                    className={`px-2 py-2 text-xs rounded-lg transition-all ${
                      position === p ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'
                    }`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-2">字体大小</span>
                <span className="font-mono text-ink">{size}px</span>
              </div>
              <input type="range" min="12" max="120" value={size} onChange={e => setSize(Number(e.target.value))} className="slider" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-2">透明度</span>
                <span className="font-mono text-ink">{opacity}%</span>
              </div>
              <input type="range" min="5" max="100" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="slider" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="swatch" />
            <span className="text-sm text-ink-2">水印颜色</span>
          </div>

          <button
            onClick={addWatermark}
            className="btn-a w-full transition-colors"
          >
            添加水印并下载
          </button>
        </>
      )}
    </div>
  );
}
