import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';

/* 这一页原本铺了 12 个一模一样的 😄 方块：纯占位，且是「当图标用的 emoji」。
   表情包素材需要后台数据支撑，没有数据时不假装有内容。 */
export default function MemesPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 max-w-3xl">
        <div className="phead">
          <h1>表情包</h1>
          <span className="note">常用表情与梗图</span>
        </div>

        <div className="card p-8 text-center">
          <div className="flex justify-center mb-3"><span className="chip"><Icon name="maskface" /></span></div>
          <p className="text-sm text-ink-2">表情包库正在接入，敬请期待</p>
          <Link to="/meme" className="btn-a mt-5">先看看常用表情</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
