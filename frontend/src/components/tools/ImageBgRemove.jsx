import { useState } from 'react';

export default function ImageBgRemove() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const removeBg = async () => {
    if (!file) return;
    setProcessing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('size', 'auto');
      
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'JLH8rG9vT5qN2wK8xP4mY7zB',
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('API 请求失败，请检查 API Key 或稍后重试');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      // Fallback: simulate processing
      setTimeout(() => {
        setError('背景移除功能需要有效的 API Key，当前为演示模式');
        setProcessing(false);
      }, 1500);
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (result) {
      const a = document.createElement('a');
      a.href = result;
      a.download = 'no-bg.png';
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('bf')?.click()}>
        <input id="bf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传图片去除背景'}</p>
        <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP</p>
      </div>
      
      {preview && !result && (
        <div className="text-center">
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
        </div>
      )}
      
      {result && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-2 text-center">原始图片</div>
            <img src={preview} alt="Original" className="w-full rounded-xl" />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-2 text-center">去背景后</div>
            <img src={result} alt="Result" className="w-full rounded-xl" />
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <button 
        onClick={removeBg} 
        disabled={!file || processing} 
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50"
      >
        {processing ? 'AI处理中...' : 'AI去背景'}
      </button>
      
      {result && (
        <button 
          onClick={download}
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600"
        >
          下载透明背景图片
        </button>
      )}
    </div>
  );
}
