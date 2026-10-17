import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../Reveal';

/**
 * FaqSection — 常见问题（左标题 + 右折叠表）
 * 用原生 details/summary：无 JS 也能展开，加减号动画在 index.css 的 .pm 里。
 * 
 * 注意：后端可能有重复数据，这里按 question+answer 去重。
 */
export default function FaqSection({ faqs = [], title = '常见问题', contactPath = '/contact' }) {
  if (faqs.length === 0) return null;

  // 按 question + answer 去重，保留第一条（避免后端重复数据）
  const uniqueKeys = [];
  const uniqueFaqs = faqs.filter((faq) => {
    const key = `${faq.question}|${faq.answer}`;
    if (uniqueKeys.includes(key)) return false;
    uniqueKeys.push(key);
    return true;
  });

  if (uniqueFaqs.length === 0) return null;

  return (
    <section className="section">
      <div className="wrap two">
        <Reveal>
          <h2 className="h">{title}</h2>
          <p className="contact">
            没找到答案？到 <Link to={contactPath}>联系我们</Link> 说清站点、线路和现象。
          </p>
        </Reveal>
        <Reveal className="faq">
          {uniqueFaqs.map((faq, idx) => (
            <details key={faq.id ?? idx}>
              <summary>
                <span>{faq.question}</span>
                <span className="pm" />
              </summary>
              <div className="ans">{faq.answer}</div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
