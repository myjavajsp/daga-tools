import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ScreenRecorderPage() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          屏幕录制
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-8xl mb-6">📹</div>
            
            <div className="text-4xl font-mono text-white mb-8">
              {String(Math.floor(duration / 60)).padStart(2, '0')}:
              {String(duration % 60).padStart(2, '0')}
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setRecording(!recording)}
                className={`px-8 py-4 rounded-xl font-bold text-lg ${
                  recording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {recording ? '停止录制' : '开始录制'}
              </button>
              
              {recording && (
                <button
                  onClick={() => {
                    setRecording(false);
                    setDuration(0);
                  }}
                  className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-lg transition-colors"
                >
                  取消
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">使用说明</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• 点击"开始录制"后选择要录制的区域</li>
              <li>• 支持录制系统音频和麦克风声音</li>
              <li>• 录制完成后自动保存为MP4格式</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}