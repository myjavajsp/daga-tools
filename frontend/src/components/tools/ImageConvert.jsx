import { useState, useRef } from 'react';
export default function ImageConvert() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const formats = [
    { value: 'image/jpeg', label: 'JPG', mime: 'image/jpeg' },
    { value: 'image/png', label: 'PNG', mime: 'image/png' },
    { value: 'image/webp', label: 'WebP', mime: 'image/webp' },
    { value: 'image/bmp', label: 'BMP', mime: 'image/bmp' },
  ];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const convert = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (format === 'image/jpeg' || format === 'image/bmp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          setResult({
            blob,
            url: URL.createObjectURL(blob),
            size: blob.size,
            format: format.split('/')[1].toUpperCase(),
          });
          setLoading(false);
        }, format, quality / 100);
      };
      img.src = URL.createObjectURL(image);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `converted.${result.format.toLowerCase()}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '点击或拖拽上传图片'}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 JPG、PNG、WebP、BMP</p>
      </div>

      {preview && (
        <>
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目标格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                质量: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-3"
              />
            </div>
          </div>

          <button
            onClick={convert}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? '转换中...' : '开始转换'}
          </button>

          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">原文件</span>
                <span className="font-medium text-gray-900 dark:text-white">{(image.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">转换后</span>
                <span className="font-medium text-green-600 dark:text-green-400">{(result.size / 1024).toFixed(1)} KB ({result.format})</span>
              </div>
              <button
                onClick={download}
                className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                下载转换后的图片
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
