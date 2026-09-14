import { useState } from 'react';

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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          二维码内容
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入网址、文本、WiFi信息等..."
          className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none"
        />
      </div>

      {/* 设置选项 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            尺寸: {size}px
          </label>
          <input
            type="range"
            min="100"
            max="500"
            step="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            前景色
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            背景色
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={generateQR}
        disabled={!text.trim() || loading}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? '生成中...' : '生成二维码'}
      </button>

      {/* 结果展示 */}
      {qrCode && (
        <div className="space-y-4">
          <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <img src={qrCode} alt="QR Code" className="max-w-full h-auto" />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              下载二维码
            </button>
            <button
              onClick={() => { setText(''); setQrCode(null); }}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              重新生成
            </button>
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-gray-200 mb-2">💡 使用提示</div>
        <ul className="space-y-1 text-xs">
          <li>• 支持生成网址、文本、WiFi信息、邮箱等各种内容的二维码</li>
          <li>• 可以使用手机扫描生成的二维码查看内容</li>
          <li>• 建议二维码内容不要太长，否则可能难以识别</li>
        </ul>
      </div>
    </div>
  );
}
