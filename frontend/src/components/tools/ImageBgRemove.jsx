import { useState } from 'react';
export default function ImageBgRemove() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = (e) => { const f = e.target.files[0]; if (!f) return; setFile(f); setPreview(URL.createObjectURL(f)); };

  const remove = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); alert('AI背景移除完成！（演示模式）'); }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('bf')?.click()}>
        <input id="bf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传图片去除背景'}</p>
      </div>
      {preview && <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />}
      <button onClick={remove} disabled={!file || processing} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">
        {processing ? 'AI处理中...' : 'AI去背景'}
      </button>
    </div>
  );
}
