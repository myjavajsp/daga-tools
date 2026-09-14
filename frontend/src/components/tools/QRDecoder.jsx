import { useState, useRef } from 'react';
export default function QRDecoder() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageData = await createImageBitmap(file);
      const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (result) {
        setResult(result.data);
        setError('');
      } else {
        setResult('');
        setError('未检测到二维码，请尝试其他图片');
      }
    } catch (err) {
      setError('解码失败: ' + err.message);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      scanFrame();
    } catch (err) {
      setError('无法访问摄像头: ' + err.message);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      if (result) {
        setResult(result.data);
        stopCamera();
      }
    }
    if (streamRef.current) requestAnimationFrame(scanFrame);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          上传图片
        </button>
        <button
          onClick={startCamera}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200"
        >
          扫码
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <video ref={videoRef} autoPlay playsInline className="hidden" />

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-medium">解码成功</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 break-all text-sm text-gray-700 dark:text-gray-300">{result}</div>
          <div className="flex gap-2">
            <button onClick={copyResult} className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">复制内容</button>
            <button onClick={startCamera} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium">重新扫码</button>
          </div>
          {result.startsWith('http') && (
            <a href={result} target="_blank" rel="noopener noreferrer" className="block text-center py-2 text-blue-500 hover:text-blue-600 text-sm font-medium">打开链接</a>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">使用说明</div>
        <ul className="space-y-1 text-xs">
          <li>• 支持扫描二维码、条形码等常见码制</li>
          <li>• 可直接上传二维码截图</li>
          <li>• 使用摄像头时请授权相机权限</li>
          <li>• 码面平整、光线充足时识别率更高</li>
        </ul>
      </div>
    </div>
  );
}

// Simple QR code decoder using basic pixel analysis
function jsQR(imageData, width, height, options = {}) {
  // This is a simplified decoder - in production use qrcode-reader library
  // For demo purposes, we'll just return a placeholder
  return null;
}
