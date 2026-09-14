import { useState } from 'react';
export default function ImageRemoveWatermark() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const remove = () => {
    setProcessing(true);
    setTimeout(() => {
      // Demo: show original as "processed"
      setProcessing(false);
      alert('AI去水印功能已处理完成！（演示模式）');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('wf')?.click()}>
        <input id="wf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">✨</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传带水印的图片'}</p>
      </div>
      {preview && <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />}
      <button onClick={remove} disabled={!file || processing} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">
        {processing ? 'AI处理中...' : 'AI去水印'}
      </button>
    </div>
  );
}
