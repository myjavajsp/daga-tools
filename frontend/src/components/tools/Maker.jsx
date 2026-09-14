import { useState } from 'react';
export default function Maker() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#3B82F6');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const draw = () => {
    if (!preview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text || '制图', canvas.width / 2, canvas.height / 2);
      if (bgColor !== '#FFFFFF') {
        ctx.fillStyle = bgColor;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(text || '制图', canvas.width / 2, canvas.height / 2);
      }
      setPreview(canvas.toDataURL());
    };
    img.src = preview;
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = preview;
    a.download = 'maker_result.png';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('mf')?.click()}>
        <input id="mf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传背景图片'}</p>
      </div>

      {preview && (
        <>
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文字内容</label>
              <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="输入文字..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">字号: {fontSize}px</label>
              <input type="range" min="12" max="200" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文字颜色</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">背景透明度</label>
              <button onClick={() => { const c = document.createElement('canvas'); c.width = 100; c.height = 100; const ctx = c.getContext('2d'); ctx.fillStyle = bgColor; ctx.globalAlpha = 0.3; ctx.fillRect(0,0,100,100); setPreview(c.toDataURL()); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm">应用蒙版</button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={draw} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">应用文字</button>
            <button onClick={download} className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600">下载图片</button>
          </div>
        </>
      )}
    </div>
  );
}
