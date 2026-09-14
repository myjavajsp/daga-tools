import { useState } from 'react';
export default function ImageEditor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  const handleFile = (e) => { const f = e.target.files[0]; if (!f) return; setFile(f); setPreview(URL.createObjectURL(f)); };

  const cssFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

  const reset = () => { setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('ef')?.click()}>
        <input id="ef" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传图片开始编辑'}</p>
      </div>
      {preview && (
        <>
          <div className="text-center">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl" style={{ filter: cssFilter }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '亮度', val: brightness, set: setBrightness, min: 0, max: 200 },
              { label: '对比度', val: contrast, set: setContrast, min: 0, max: 200 },
              { label: '饱和度', val: saturation, set: setSaturation, min: 0, max: 200 },
              { label: '模糊', val: blur, set: setBlur, min: 0, max: 20 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-900 dark:text-white">{val}</span></div>
                <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl">重置</button>
            <button onClick={() => { const a = document.createElement('a'); a.href = preview; a.download = 'edited.png'; a.click(); }} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg">保存</button>
          </div>
        </>
      )}
    </div>
  );
}
