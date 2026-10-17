import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 max-w-3xl">
        <div className="phead">
          <h1>关于全民影视</h1>
          <span className="note">服务说明与联系方式</span>
        </div>

        <div className="card p-5 sm:p-8 article">
          <h2>我们的使命</h2>
          <p>
            全民影视致力于为用户提供免费、便捷的视频解析服务。
            我们支持主流视频平台的 VIP 视频在线播放，让您随时随地享受精彩内容。
          </p>

          <h2>服务范围</h2>
          <ul>
            <li>腾讯视频、优酷、爱奇艺、芒果 TV 等主流平台</li>
            <li>支持 M3U8、MP4 等多种视频格式</li>
            <li>高清画质，流畅播放</li>
            <li>无需下载，即点即看</li>
          </ul>

          <h2>联系我们</h2>
          <p>如有任何问题或建议，请通过以下方式联系我们：</p>
          <p>邮箱：support@ityvip.xyz<br />微信：ityvip2024</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
