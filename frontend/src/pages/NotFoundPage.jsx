export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-ink-2 mb-4">404</div>
        <h1 className="text-3xl font-bold text-ink mb-4">页面不存在</h1>
        <p className="text-ink-3 mb-8">抱歉，您访问的页面已被移除或不存在</p>
        <a
          href="/"
          className="btn-a inline-block px-8 transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}