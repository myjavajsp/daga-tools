import Header from '../components/Header';
import Footer from '../components/Footer';

const SECTIONS = [
  ['1. 服务内容', '全民影视提供免费的视频解析服务。我们不对服务的完整性、准确性做任何保证。'],
  ['2. 用户责任', '用户应遵守相关法律法规，不得利用本服务从事任何违法活动。用户对其使用行为负全部责任。'],
  ['3. 知识产权', '本网站的内容受知识产权法保护。未经授权使用本站内容可能导致法律后果。'],
  ['4. 免责声明', '我们对第三方链接的内容不承担任何责任。使用本服务产生的任何风险由用户自行承担。'],
  ['5. 服务变更', '我们保留随时修改或终止服务的权利，恕不另行通知。'],
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 max-w-3xl">
        <div className="phead">
          <h1>服务条款</h1>
          <span className="note">使用本站服务即视为同意以下条款</span>
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
