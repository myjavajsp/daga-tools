import React, { useMemo } from 'react';

/**
 * FullscreenFrame —— 解析播放器容器（无浮层按钮）
 *
 * 跨域 iframe 的全屏**本来就是支持的**，前提是外层 iframe 元素显式委派权限：
 *   - `allowFullScreen` / `webkitallowfullscreen` / `mozallowfullscreen`
 *     老式「全屏委派」属性，各内核的兼容写法都要给全。
 *   - `allow="fullscreen *"`
 *     Permissions Policy 写法。`fullscreen` 的默认 allowlist 是 `self`，
 *     也就是说**跨域 iframe 默认拿不到全屏权限**——这正是之前全屏按钮点不动的原因。
 *     写成 `fullscreen *` 表示委派给任意来源，可穿透解析站内部
 *     「外壳页 -> 播放器页」的多层嵌套。
 *
 * src 直接使用原始线路地址（如 https://im1907.top/?jx=...），
 * 不再套本站的 /api/video/jx 同源代理前缀。
 *
 * 注意：去掉代理后，iframe 直接嵌套第三方解析站，能否正常嵌帧取决于
 * 上游是否放行被嵌套（X-Frame-Options / CSP frame-ancestors）。
 * 这里仍保留 fullscreen 委派属性，尽量让播放器自带全屏按钮可用。
 *
 * 因此这里不需要、也不应该再叠加任何浮层按钮：
 *   播放器自带的全屏按钮即可正常工作（Esc 退出）。
 */
export default function FullscreenFrame({ src, title = '视频播放', onLoad, onError, fill = false }) {
  // 直接使用原始线路地址，不再套本站同源代理前缀
  const frameSrc = useMemo(() => {
    if (!src) return null;
    return src;
  }, [src]);

  if (!frameSrc) return null;

  /* fill：父级已经给了 16:9 的定位盒子（首页 .player .frame），
     这里就不再自带 padding-top 盒子，否则会二次撑高。 */
  if (fill) {
    return (
      <iframe
        src={frameSrc}
        title={title}
        allow="fullscreen *; autoplay; encrypted-media; picture-in-picture; clipboard-write"
        allowFullScreen
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        onLoad={onLoad}
        onError={onError}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, display: 'block' }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9
        background: '#000',
      }}
    >
      <iframe
        src={frameSrc}
        title={title}
        /* 关键：把 fullscreen 委派给任意来源，尽量让被嵌解析站内部点全屏可用 */
        allow="fullscreen *; autoplay; encrypted-media; picture-in-picture; clipboard-write"
        allowFullScreen
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        onLoad={onLoad}
        onError={onError}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
        }}
      />
    </div>
  );
}
