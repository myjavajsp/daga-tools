import { useState } from 'react';
import Icon from '../components/Icons';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FIELDS = [
  { name: 'name', label: '姓名', type: 'text', placeholder: '请输入您的姓名' },
  { name: 'email', label: '邮箱', type: 'email', placeholder: '请输入您的邮箱' },
  { name: 'subject', label: '主题', type: 'text', placeholder: '请输入主题' },
];

export default function ContactPage() {
  const empty = { name: '', email: '', subject: '', message: '' };
  const [formData, setFormData] = useState(empty);
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
      setFormData(empty);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="wrap py-8 max-w-2xl">
        <div className="phead">
          <h1>联系我们</h1>
          <span className="note">问题、建议与商务合作</span>
        </div>

        {submitted ? (
          <div className="card p-8 text-center">
            <div className="flex justify-center mb-3"><span className="chip"><Icon name="check" /></span></div>
            <h2 className="text-xl font-bold text-ink mb-2">提交成功！</h2>
            <p className="text-sm text-ink-3">我们会尽快回复您的消息。</p>
            <button onClick={() => setSubmitted(false)} className="btn-a mt-6">
              继续发送
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-5 sm:p-8 space-y-5">
            {FIELDS.map((f) => (
              <div key={f.name}>
                <label className="lbl" htmlFor={`cf-${f.name}`}>{f.label}</label>
                <input
                  id={`cf-${f.name}`}
                  className="input"
                  type={f.type}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required
                />
              </div>
            ))}

            <div>
              <label className="lbl" htmlFor="cf-message">留言内容</label>
              <textarea
                id="cf-message"
                className="input"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="请输入您的留言"
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-a w-full">
              {submitting ? '提交中…' : '提交消息'}
            </button>
          </form>
        )}

        <div className="mt-6 space-y-2 text-sm text-ink-3">
          <p className="flex items-center gap-2"><Icon name="mail" />邮箱：support@ityvip.xyz</p>
          <p className="flex items-center gap-2"><Icon name="chat" />微信：ityvip2024</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
