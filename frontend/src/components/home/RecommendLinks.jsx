import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icons';
import Reveal from '../Reveal';

/**
 * RecommendLinks — 推荐内容区（一大卡 + 竖版封面卡）
 *
 * 吃「归一化后」的条目，不自己猜后端字段形状：
 * { key, title, desc, meta: string[], cover?, to?, href? }
 *  - to   → 站内 <Link>（文章 /article/:slug）
 *  - href → 站外 <a target=_blank>（后台 recommend_links 配的友情链接）
 * 没有配图时不放假图、也不上渐变，只留一枚极淡的线性影片标记。
 *
 * 兼容旧用法：如果传进来的还是 recommend_links 原始行
 * （{ name, link_url, icon_url }），组件里会先归一化。
 */
function normalize(items = []) {
  return items.map((raw, i) => {
    if (raw.title || raw.to || raw.href) {
      return {
        key: raw.key ?? raw.id ?? i,
        title: raw.title ?? raw.name ?? '',
        desc: raw.desc ?? raw.excerpt ?? '',
        meta: raw.meta ?? [raw.category, raw.published_at, raw.site].filter(Boolean),
        cover: raw.cover ?? raw.cover_image ?? raw.icon_url,
        to: raw.to,
        href: raw.href ?? raw.link_url,
      };
    }
    return {
      key: raw.id ?? i,
      title: raw.name ?? '',
      desc: '',
      meta: [raw.category].filter(Boolean),
      cover: raw.icon_url,
      href: raw.link_url,
    };
  });
}

function Card({ item, className, children }) {
  if (item.to) return <Link to={item.to} className={className}>{children}</Link>;
  return (
    <a href={item.href || '#'} className={className} target={item.href ? '_blank' : undefined} rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function RecommendLinks({ items = [], title = '最新推荐', note = '按发布时间排序', moreTo = '/recommend' }) {
  const list = normalize(items).filter((it) => it.title);
  if (list.length === 0) return null;

  const [lead, ...rest] = list;
  const grid = rest.slice(0, 3);

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <h2>{title}</h2>
          {note && <span className="note">{note}</span>}
          <Link to={moreTo} className="more">
            {moreTo === '/recommend' ? '影视推荐' : '更多'}
            <Icon name="arrow" />
          </Link>
        </div>

        <Reveal>
          <Card item={lead} className="rec-feat">
            <span className="top">
              {lead.cover ? (
                <img src={lead.cover} alt={lead.title} loading="lazy" />
              ) : (
                <span className="mark">
                  <Icon name="film" className="cov-ic" />
                </span>
              )}
            </span>
            <span className="body">
              {lead.meta.length > 0 && (
                <span className="meta-row">
                  {lead.meta.map((m, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="bar" />}
                      <span className={idx === 0 ? 'k' : undefined}>{m}</span>
                    </React.Fragment>
                  ))}
                </span>
              )}
              <h3>{lead.title}</h3>
              {lead.desc && <p>{lead.desc}</p>}
              <span className="op">
                去看看
                <Icon name="arrow" />
              </span>
            </span>
          </Card>

          {grid.length > 0 && (
            <div className="rec-grid">
              {grid.map((item, idx) => (
                <Card item={item} className="rcard" key={item.key}>
                  <span className="cov">
                    <span className="rk">{String(idx + 1).padStart(2, '0')}</span>
                    {item.cover ? (
                      <img src={item.cover} alt={item.title} loading="lazy" />
                    ) : (
                      <span className="mark">
                        <Icon name="film" className="cov-ic" />
                      </span>
                    )}
                  </span>
                  <span>
                    <h4>{item.title}</h4>
                    {item.meta.length > 0 && <span className="m">{item.meta.join(' · ')}</span>}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
