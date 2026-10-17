import React from 'react';

/**
 * AdBanner — 广告位（后台 ads 表投放的第三方代码）
 *
 * 版式跟着 demo 走：灰底 + 虚线发丝边框，明确是广告位而不是内容；
 * 广告标签用等宽小字，压在内容上方一条分隔线下面。
 * 第三方 code 仍用 dangerouslySetInnerHTML 原样注入（与线上一致），
 * 内容由后台运营写入，前端不做解析。
 *
 * @param {Array} ads  [{ id, name, code, position }]
 * @param {boolean} row 多广告并排（2/3/5 列，随宽度递进）
 */
export default function AdBanner({ ads = [], row = false }) {
  if (ads.length === 0) return null;

  const cls = row ? 'ad-row' : 'ad-col';

  return (
    <div className={cls}>
      {ads.map((ad) => (
        <div className="ad-slot" key={ad.id}>
          {ad.name && <span className="tag">广告 · {ad.name}</span>}
          <div className="ad-body" dangerouslySetInnerHTML={{ __html: ad.code }} />
        </div>
      ))}
    </div>
  );
}
