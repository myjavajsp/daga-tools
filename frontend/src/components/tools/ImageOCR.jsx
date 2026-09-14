import { useState } from 'react';
export default function ImageOCR() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult('');
  };

  const ocr = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ocr', { method: 'POST', body: new FormData().append('image', file) });
      const data = await res.json();
      setResult(data.text || '识别完成');
    } catch {
      setResult('这是一张演示图片\n\n实际OCR功能需要接入后端服务\n\n当前为演示模式');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('of')?.click()}>
        <input id="of" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📷</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传截图或照片'}</p>
      </div>
      {preview && <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />}
      <button onClick={ocr} disabled={!file || loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">
        {loading ? '识别中...' : '开始识别'}
      </button>
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">识别结果</label>
            <button onClick={() => navigator.clipboard.writeText(result)} className="text-xs text-blue-500">复制</button>
          </div>
          <textarea value={result} readOnly className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none" />
        </div>
      )}
    </div>
  );
}
