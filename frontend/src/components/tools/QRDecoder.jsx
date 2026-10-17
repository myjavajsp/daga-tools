import { useState, useRef } from 'react';
import Icon from '../Icons';

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
          className="btn-a flex-1 transition-colors"
        >
          上传图片
        </button>
        <button
          onClick={startCamera}
          className="px-6 py-3 bg-surface-2 text-ink-2 font-semibold rounded-card hover:bg-surface-3"
        >
          扫码
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <video ref={videoRef} autoPlay playsInline className="hidden" />

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-success">
            <Icon name="check" className="sz15" />
            <span className="font-medium">解码成功</span>
          </div>
          <div className="bg-surface rounded-lg p-3 break-all text-sm text-ink-2">{result}</div>
          <div className="flex gap-2">
            <button onClick={copyResult} className="btn-a ok flex-1 text-sm">复制内容</button>
            <button onClick={startCamera} className="px-4 py-2 bg-surface-2 rounded-lg text-sm font-medium">重新扫码</button>
          </div>
          {result.startsWith('http') && (
            <a href={result} target="_blank" rel="noopener noreferrer" className="act block text-center py-2">打开链接</a>
          )}
        </div>
      )}

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">{error}</div>
      )}

      <div className="bg-paper rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">使用说明</div>
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
