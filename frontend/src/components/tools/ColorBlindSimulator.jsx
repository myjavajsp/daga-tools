import { useState } from 'react';
import Icon from '../Icons';
const FILTERS = {
  protanopia: { name: '红色盲', color: '#ff6b6b' },
  deuteranopia: { name: '绿色盲', color: '#4ecdc4' },
  tritanopia: { name: '蓝色盲', color: '#45b7d1' },
};
export default function ColorBlindSimulator() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState('normal');
  const canvasRef = useState(null)[1];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        applyFilter(img, 'normal');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = (img, type) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (type === 'normal') {
      setPreview(canvas.toDataURL());
      return;
    }

    const matrix = {
      protanopia: [0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0],
      deuteranopia: [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0.3, 0.7, 0, 0],
      tritanopia: [0.95, 0.05, 0, 0, 0, 0.433, 0.567, 0, 0, 0.475, 0.525, 0, 0],
    };

    const m = matrix[type];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = r * m[0] + g * m[1] + b * m[2];
      data[i + 1] = r * m[5] + g * m[6] + b * m[7];
      data[i + 2] = r * m[10] + g * m[11] + b * m[12];
    }
    ctx.putImageData(imageData, 0, 0);
    setPreview(canvas.toDataURL());
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input id="fileInput" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="palette" /></span></div>
        <p className="text-ink-2">{preview ? '点击更换图片' : '点击上传测试图片'}</p>
      </div>

      {preview && (
        <>
          <div className="flex gap-2 flex-wrap">
            {[{ id: 'normal', label: '正常' }, ...Object.entries(FILTERS).map(([id, v]) => ({ id, label: v.name }))].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setFilter(id); image && applyFilter(image, id); }}
                className={`px-4 py-2 rounded-card text-sm font-medium transition-all ${
                  filter === id ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative rounded-card overflow-hidden border border-line">
            <img src={preview} alt="Preview" className="w-full h-auto" />
          </div>
        </>
      )}

      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">使用说明</div>
        <ul className="space-y-1 text-xs">
          <li>• 上传包含多种颜色的图片进行测试</li>
          <li>• 红色盲难以分辨红色和绿色</li>
          <li>• 绿色盲对绿色敏感度降低</li>
          <li>• 蓝色盲难以分辨蓝色和黄色</li>
        </ul>
      </div>
    </div>
  );
}
