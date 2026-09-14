import { useState, useRef } from 'react';
const FILTERS = [
  { name: '原始', apply: (c) => c },
  { name: ' grayscale', apply: (r, g, b) => { const v = 0.299 * r + 0.587 * g + 0.114 * b; return [v, v, v]; } },
  { name: ' sepia', apply: (r, g, b) => [r * 0.393 + g * 0.769 + b * 0.189, r * 0.349 + g * 0.686 + b * 0.168, r * 0.272 + g * 0.534 + b * 0.131] },
  { name: ' invert', apply: (r, g, b) => [255 - r, 255 - g, 255 - b] },
  { name: ' blur', apply: (r, g, b, a) => [r, g, b, a], blur: true },
  { name: ' brighten', apply: (r, g, b) => [Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, b + 40)] },
  { name: ' darken', apply: (r, g, b) => [Math.max(0, r - 40), Math.max(0, g - 40), Math.max(0, b - 40)] },
  { name: ' warm', apply: (r, g, b) => [Math.min(255, r + 20), g, Math.max(0, b - 20)] },
  { name: ' cool', apply: (r, g, b) => [Math.max(0, r - 20), g, Math.min(255, b + 20)] },
  { name: ' vintage', apply: (r, g, b) => [r * 0.9 + 30, g * 0.7 + 15, b * 0.5] },
  { name: ' cyberpunk', apply: (r, g, b) => [Math.min(255, r + 30), g * 0.8, Math.min(255, b + 50)] },
  { name: ' dramatic', apply: (r, g, b) => { const avg = (r + g + b) / 3; return [avg > 128 ? 255 : r * 1.5, avg > 128 ? g : g * 0.5, avg > 128 ? b * 0.5 : b]; } },
];
export default function ImageFilters() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeFilter, setActiveFilter] = useState(0);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setPreview(ev.target.result);
        setActiveFilter(0);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = (filterIndex) => {
    if (!image) return;
    setActiveFilter(filterIndex);
    const filter = FILTERS[filterIndex];
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (filter.blur) {
      ctx.filter = 'blur(4px)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    } else {
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = filter.apply(data[i], data[i + 1], data[i + 2]);
        data[i] = r; data[i + 1] = g; data[i + 2] = b;
      }
      ctx.putImageData(imageData, 0, 0);
    }
    setPreview(canvas.toDataURL());
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = preview;
    a.download = `filtered_${FILTERS[activeFilter].name}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '点击上传图片'}</p>
      </div>

      {preview && (
        <>
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />
          
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {FILTERS.map((f, i) => (
              <button
                key={i}
                onClick={() => applyFilter(i)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === i ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={download} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              下载滤镜图片
            </button>
            <button onClick={() => { setPreview(null); setImage(null); }} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl">
              重置
            </button>
          </div>
        </>
      )}
    </div>
  );
}
