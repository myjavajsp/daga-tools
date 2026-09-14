import { useState } from 'react';
export default function ImageCompress() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [quality, setQuality] = useState(80);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const compress = () => {
    if (!image) return;
    setLoading(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        setResult({ url: URL.createObjectURL(blob), size: blob.size, original: image.size, ratio: ((1 - blob.size / image.size) * 100).toFixed(1) });
        setLoading(false);
      }, 'image/jpeg', quality / 100);
    };
    img.src = URL.createObjectURL(image);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('cif')?.click()}>
        <input id="cif" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传图片压缩'}</p>
      </div>
      {preview && <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />}
      {image && (
        <>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 dark:text-gray-400">压缩质量</span><span className="font-mono text-blue-600 dark:text-blue-400">{quality}%</span></div>
            <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
          </div>
          <button onClick={compress} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">{loading ? '压缩中...' : '开始压缩'}</button>
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center space-y-2">
              <div className="text-green-700 dark:text-green-400 font-medium">压缩完成!</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-gray-500">原大小</div><div className="font-bold">{Math.round(result.original / 1024)}KB</div></div>
                <div><div className="text-gray-500">压缩后</div><div className="font-bold text-green-600">{Math.round(result.size / 1024)}KB</div></div>
                <div><div className="text-gray-500">节省</div><div className="font-bold text-blue-600">-{result.ratio}%</div></div>
              </div>
              <img src={result.url} alt="Result" className="max-h-32 mx-auto rounded-lg" />
              <a href={result.url} download="compressed.jpg" className="inline-block px-6 py-2 bg-green-500 text-white rounded-xl text-sm font-medium">下载</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
