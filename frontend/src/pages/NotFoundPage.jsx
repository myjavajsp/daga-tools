export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-700 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">页面不存在</h1>
        <p className="text-gray-400 mb-8">抱歉，您访问的页面已被移除或不存在</p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}