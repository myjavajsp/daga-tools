import { useState } from 'react';
import Icon from '../Icons';
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
      <div className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer" onClick={() => document.getElementById('ef')?.click()}>
        <input id="ef" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="palette" /></span></div>
        <p className="text-ink-2">{preview ? '点击更换图片' : '上传图片开始编辑'}</p>
      </div>
      {preview && (
        <>
          <div className="text-center">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-card" style={{ filter: cssFilter }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '亮度', val: brightness, set: setBrightness, min: 0, max: 200 },
              { label: '对比度', val: contrast, set: setContrast, min: 0, max: 200 },
              { label: '饱和度', val: saturation, set: setSaturation, min: 0, max: 200 },
              { label: '模糊', val: blur, set: setBlur, min: 0, max: 20 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1"><span className="text-ink-2">{label}</span><span className="font-mono text-ink">{val}</span></div>
                <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} className="slider" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-3 bg-surface-2 text-ink-2 font-semibold rounded-card">重置</button>
            <button onClick={() => { const a = document.createElement('a'); a.href = preview; a.download = 'edited.png'; a.click(); }} className="btn-a flex-1">保存</button>
          </div>
        </>
      )}
    </div>
  );
}
