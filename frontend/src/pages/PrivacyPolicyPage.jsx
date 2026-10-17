import Header from '../components/Header';
import Footer from '../components/Footer';

const SECTIONS = [
  ['1. 信息收集', '我们仅收集必要的访问统计数据，用于改进服务质量。不会收集您的个人身份信息。'],
  ['2. 数据使用', '收集的数据仅用于分析网站使用情况，优化用户体验。我们不会将数据分享给第三方。'],
  ['3. 数据安全', '我们采用行业标准的安保措施来保护您的数据安全。所有数据传输均通过 HTTPS 加密。'],
  ['4. Cookie 使用', '本网站使用 Cookie 来改善用户体验。您可以通过浏览器设置管理 Cookie 偏好。'],
  ['5. 政策更新', '我们可能会不时更新本隐私政策。重大变更将通过网站公告通知您。'],
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 max-w-3xl">
        <div className="phead">
          <h1>隐私政策</h1>
          <span className="note">适用于全民影视全站服务</span>
        </div>

        <div className="card p-5 sm:p-8 article">
          {SECTIONS.map(([title, body]) => (
            <div key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
