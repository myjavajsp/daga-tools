import { useState } from 'react';
export default function ImageUpscaler() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);

  const handleFile = (e) => { const f = e.target.files[0]; if (!f) return; setFile(f); setPreview(URL.createObjectURL(f)); };

  const upscale = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); alert(`图片已放大${scale}倍（演示模式）`); }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('uf')?.click()}>
        <input id="uf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传图片放大'}</p>
      </div>
      {preview && <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">放大倍数</label>
        <div className="flex gap-2">
          {[2, 4].map(s => <button key={s} onClick={() => setScale(s)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${scale === s ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{s}x</button>)}
        </div>
      </div>
      <button onClick={upscale} disabled={!file || processing} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">{processing ? '处理中...' : 'AI放大'}</button>
    </div>
  );
}
