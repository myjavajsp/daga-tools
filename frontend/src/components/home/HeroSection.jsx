import React from 'react';
import Reveal from '../Reveal';

/**
 * HeroSection — 首屏
 *
 * 有 aside 时是双栏（左标题+解析框，右播放器）；
 * 没有 aside 时是单栏（标题+解析框全宽），播放器另起一行放在下面。
 */
export default function HeroSection({ title, lead, aside, children }) {
  const hasAside = !!aside;

  return (
    <section className="hero">
      <div className={hasAside ? 'wrap hero-grid' : 'wrap'}>
        <Reveal>
          <h1>{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {children}
        </Reveal>
        {hasAside && <Reveal>{aside}</Reveal>}
      </div>
    </section>
  );
}
