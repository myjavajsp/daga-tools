import React, { useEffect, useState } from 'react';
import Icon from './Icons';

/**
 * BackToTop — 回顶按钮
 * 480px 之后才出现；样式（含隐藏态 pointer-events）全在 index.css 的 .totop。
 */
export default function BackToTop({ threshold = 480 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <button
      type="button"
      className={`totop${show ? ' show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="返回顶部"
    >
      <Icon name="up" />
    </button>
  );
}
