import React, { useEffect, useRef } from 'react';

/**
 * Reveal — 滚动出现（translateY 14px → 0，500ms）
 *
 * 只依赖 IntersectionObserver 是不够的：页面处于 hidden/预渲染状态时它不回调，
 * 整页会停在 opacity:0（demo 阶段踩过）。所以保留两道兜底：
 * 1) 1.2s 后把已经在视口内的元素直接揭示；
 * 2) visibilitychange 回前台时再兜一次。
 * 动画本体由 .js .reveal 控制，没有 js 类（脚本被禁）时元素始终可见。
 */
export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const show = () => el.classList.add('in');

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      show();
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show();
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);

    const inViewport = () => {
      const b = el.getBoundingClientRect();
      return b.top < window.innerHeight && b.bottom > 0;
    };
    const timer = setTimeout(() => { if (inViewport()) show(); }, 1200);
    const onVisibility = () => { if (!document.hidden && inViewport()) show(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
