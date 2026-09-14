import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            隐私政策
          </h1>
          
          <div className="bg-gray-800 rounded-xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">1. 信息收集</h2>
              <p className="text-gray-300">
                我们仅收集必要的访问统计数据，用于改进服务质量。不会收集您的个人身份信息。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. 数据使用</h2>
              <p className="text-gray-300">
                收集的数据仅用于分析网站使用情况，优化用户体验。我们不会将数据分享给第三方。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. 数据安全</h2>
              <p className="text-gray-300">
                我们采用行业标准的安保措施来保护您的数据安全。所有数据传输均通过HTTPS加密。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Cookie使用</h2>
              <p className="text-gray-300">
                本网站使用Cookie来改善用户体验。您可以通过浏览器设置管理Cookie偏好。
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. 政策更新</h2>
              <p className="text-gray-300">
                我们可能会不时更新本隐私政策。重大变更将通过网站公告通知您。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}