import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            关于全民影视
          </h1>
          
          <div className="bg-gray-800 rounded-xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">我们的使命</h2>
              <p className="text-gray-300 leading-relaxed">
                全民影视致力于为用户提供免费、便捷的视频解析服务。
                我们支持主流视频平台的VIP视频在线播放，让您随时随地享受精彩内容。
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">服务范围</h2>
              <ul className="text-gray-300 space-y-2">
                <li>✅ 腾讯视频、优酷、爱奇艺、芒果TV等主流平台</li>
                <li>✅ 支持M3U8、MP4等多种视频格式</li>
                <li>✅ 高清画质，流畅播放</li>
                <li>✅ 无需下载，即点即看</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">联系我们</h2>
              <p className="text-gray-300">
                如有任何问题或建议，请通过以下方式联系我们：
              </p>
              <div className="mt-4 space-y-2 text-gray-400">
                <p>📧 Email: support@ityvip.xyz</p>
                <p>💬 微信: ityvip2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}