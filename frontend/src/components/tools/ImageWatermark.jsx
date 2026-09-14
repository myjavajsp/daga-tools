import { useState } from 'react';
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
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input id="fileInput" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">💧</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '点击上传图片'}</p>
      </div>

      {preview && (
        <>
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">水印文字</label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">位置</label>
              <div className="grid grid-cols-3 gap-1">
                {positions.map(p => (
                  <button
                    key={p}
                    onClick={() => setPosition(p)}
                    className={`px-2 py-2 text-xs rounded-lg transition-all ${
                      position === p ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
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
                <span className="text-gray-600 dark:text-gray-400">字体大小</span>
                <span className="font-mono text-gray-900 dark:text-white">{size}px</span>
              </div>
              <input type="range" min="12" max="120" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">透明度</span>
                <span className="font-mono text-gray-900 dark:text-white">{opacity}%</span>
              </div>
              <input type="range" min="5" max="100" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <span className="text-sm text-gray-600 dark:text-gray-400">水印颜色</span>
          </div>

          <button
            onClick={addWatermark}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            添加水印并下载
          </button>
        </>
      )}
    </div>
  );
}
