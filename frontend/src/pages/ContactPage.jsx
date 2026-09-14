import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // 模拟提交
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            联系我们
          </h1>
          
          {submitted ? (
            <div className="bg-green-900/50 border border-green-500 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-white mb-2">提交成功！</h2>
              <p className="text-gray-300">我们会尽快回复您的消息。</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                继续发送
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">姓名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">邮箱</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="请输入您的邮箱"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">主题</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="请输入主题"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">留言内容</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="请输入您的留言"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? '提交中...' : '提交消息'}
              </button>
            </form>
          )}
          
          <div className="mt-8 text-center text-gray-400">
            <p>💬 微信: ityvip2024</p>
            <p>📧 Email: support@ityvip.xyz</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}