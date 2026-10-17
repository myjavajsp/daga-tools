import Header from '../components/Header';
import Footer from '../components/Footer';
import ScreenRecorder from '../components/tools/ScreenRecorder';

/* 旧版本有三处坏掉：useState 没有 import（一进页面就白屏）、📹 当图标用、
   录制按钮只翻状态不录任何东西。现在页面只负责外壳，录制交给 tools/ScreenRecorder。 */
export default function ScreenRecorderPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 max-w-3xl">
        <div className="phead">
          <h1>屏幕录制</h1>
          <span className="note">录制完成后直接在页面预览并下载</span>
        </div>

        <div className="card p-5 sm:p-6">
          <ScreenRecorder />
        </div>

        <div className="article mt-8 text-sm">
          <h2>使用说明</h2>
          <ol>
            <li>点击「开始录制」，在浏览器弹出的窗口里选择整个屏幕、某个窗口或某个标签页。</li>
            <li>需要同时录声音时，勾选弹窗里的「分享标签页中的音频」。</li>
            <li>点击本页的「停止录制」，或浏览器顶栏的「停止分享」，录制都会正常收束。</li>
            <li>录制内容只在你的浏览器里生成和保存，不会上传到服务器。</li>
          </ol>
          <p>输出格式为 WebM（由浏览器决定编码）。如果需要 MP4，可以用格式转换工具再转一次。</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
