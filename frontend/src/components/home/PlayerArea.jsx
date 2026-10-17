import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Icon from '../Icons';
import FullscreenFrame from '../common/FullscreenFrame';

/**
 * PlayerArea — 解析结果落点（首页首屏右栏）
 *
 * 版式来自 demo 的 .player：16:9 画框 + 下面一条 meta（当前线路 / 状态 / 重试）。
 * iframe 仍走 FullscreenFrame（跨域全屏权限委派那套不能丢），
 * 用 fill 模式让它贴满 .frame，不再自带 padding-top 盒子。
 *
 * 状态文字只报事实：待解析 / 解析中 / 已载入 / 载入失败。
 * 清晰度由源站与线路决定，本站拿不到，所以不写「1080P」这种假数字。
 */
export default function PlayerArea({ videoUrl, currentInterface, cap = '画面由源站提供，清晰度取决于站点与线路' }) {
  const [iframeKey, setIframeKey] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 纯计算 iframe src（无副作用）
  const iframeSrc = useMemo(() => {
    if (!videoUrl || !currentInterface) return null;
    let baseUrl = currentInterface.url;
    if (baseUrl.startsWith('//')) baseUrl = 'https:' + baseUrl;
    return baseUrl + encodeURIComponent(videoUrl);
  }, [videoUrl, currentInterface]);

  // 当 iframeSrc 变化时，重置状态
  useEffect(() => {
    if (iframeSrc) {
      setLoadError(false);
      setIsLoading(true);
      console.log('[PlayerArea] Loading:', iframeSrc.substring(0, 80) + '...');
    } else {
      setIsLoading(false);
    }
  }, [iframeSrc]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setLoadError(false);
    console.log('[PlayerArea] iframe loaded OK');
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setLoadError(true);
    console.error('[PlayerArea] iframe load error');
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const lineName = currentInterface?.name;
  const stateText = !iframeSrc ? '待解析' : loadError ? '载入失败' : isLoading ? '解析中' : '已载入';

  return (
    <>
      <div className="player">
        <div className="frame">
          {iframeSrc && !loadError && (
            <FullscreenFrame
              key={iframeKey}
              src={iframeSrc}
              title="视频解析播放器"
              fill
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}

          {/* 载入中：压在画框上的转圈，不动 iframe 本身（重载会丢进度） */}
          {iframeSrc && isLoading && !loadError && (
            <div className="center dim">
              <div>
                <div className="spin" />
                <p className="hint">正在解析 · {lineName}</p>
              </div>
            </div>
          )}

          {loadError && (
            <div className="center">
              <div>
                <p className="hint gap2">这一条线路没放出来。换一条线路，或刷新后重试。</p>
                <button type="button" className="btn-ghost" onClick={handleRetry}>
                  <Icon name="refresh" className="sz15" />
                  重试
                </button>
              </div>
            </div>
          )}

          {!iframeSrc && (
            <div className="center">
              <div>
                <Icon name="film" className="lead-ic" />
                <p className="hint">粘贴链接并点「解析播放」，画面会出现在这里</p>
              </div>
            </div>
          )}
        </div>

        <div className="meta">
          {/* 左槽＝线路名，右槽＝状态。未解析时没有线路，写「未选线路」而不是
              把状态文字重复一遍（两边都回落到「待解析」会读成两遍）。 */}
          <span className="now">
            <span className={lineName ? 'sq' : 'sq idle'} />
            <b>{lineName || '未选线路'}</b>
          </span>
          <span className="res">{stateText}</span>
        </div>
      </div>
      {cap && <p className="player-cap">{cap}</p>}
    </>
  );
}
