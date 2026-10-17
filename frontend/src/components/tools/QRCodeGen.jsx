import { useState } from 'react';
import Icon from '../Icons';

export default function QRCodeGen() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&color=${foregroundColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}`;
      
      setQrCode(url);
    } catch (error) {
      console.error('QR generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCode) {
      const a = document.createElement('a');
      a.href = qrCode;
      a.download = 'qrcode.png';
      a.target = '_blank';
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div>
        <label className="lbl">
          二维码内容
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入网址、文本、WiFi信息等..."
          className="w-full h-24 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft focus:border-accent resize-none"
        />
      </div>

      {/* 设置选项 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="lbl">
            尺寸: {size}px
          </label>
          <input
            type="range"
            min="100"
            max="500"
            step="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="slider"
          />
        </div>
        
        <div>
          <label className="lbl">
            前景色
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
              className="swatch"
            />
            <input
              type="text"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
              className="flex-1 px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="lbl">
            背景色
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="swatch"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
            />
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={generateQR}
        disabled={!text.trim() || loading}
        className="btn-a w-full disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '生成中...' : '生成二维码'}
      </button>

      {/* 结果展示 */}
      {qrCode && (
        <div className="space-y-4">
          <div className="card flex justify-center p-4">
            <img src={qrCode} alt="QR Code" className="max-w-full h-auto" />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="btn-a flex-1 transition-colors"
            >
              下载二维码
            </button>
            <button
              onClick={() => { setText(''); setQrCode(null); }}
              className="flex-1 py-3 bg-surface-2 text-ink-2 font-semibold rounded-card hover:bg-surface-3 transition-all"
            >
              重新生成
            </button>
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="flex items-center gap-2 font-medium text-ink mb-2 text-sm"><Icon name="bulb" /><span>使用提示</span></div>
        <ul className="space-y-1 text-xs">
          <li>• 支持生成网址、文本、WiFi信息、邮箱等各种内容的二维码</li>
          <li>• 可以使用手机扫描生成的二维码查看内容</li>
          <li>• 建议二维码内容不要太长，否则可能难以识别</li>
        </ul>
      </div>
    </div>
  );
}
