import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            服务条款
          </h1>
          
          <div className="bg-gray-800 rounded-xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">1. 服务内容</h2>
              <p className="text-gray-300">
                全民影视提供免费的视频解析服务。我们不对服务的完整性、准确性做任何保证。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. 用户责任</h2>
              <p className="text-gray-300">
                用户应遵守相关法律法规，不得利用本服务从事任何违法活动。用户对其使用行为负全部责任。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. 知识产权</h2>
              <p className="text-gray-300">
                本网站的内容受知识产权法保护。未经授权使用本站内容可能导致法律后果。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. 免责声明</h2>
              <p className="text-gray-300">
                我们对第三方链接的内容不承担任何责任。使用本服务产生的任何风险由用户自行承担。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. 服务变更</h2>
              <p className="text-gray-300">
                我们保留随时修改或终止服务的权利，恕不另行通知。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}