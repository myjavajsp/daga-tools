import React from 'react';
import Icon from '../Icons';

/**
 * NoticeBanner — 公告条（后台 announcement 开启且非空时由 HomePage 调用）
 * 版式＝demo 的 .notice：灰底、发丝线、警示线性图标，不标红不放大。
 */
export default function NoticeBanner({ message, title }) {
  if (!message) return null;

  return (
    <div className="notice">
      <Icon name="alert" />
      <p>
        <b>{title || '公告'}</b>
        {message}
      </p>
    </div>
  );
}
