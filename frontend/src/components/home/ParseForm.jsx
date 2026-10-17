import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icons';

/** 线路胶囊超过这个数量就折起来，避免首屏变成一墙标签 */
const LINE_LIMIT = 6;

/**
 * ParseForm — 首屏解析表单（明亮清爽 v5）
 *
 * 三件事：输入框（.field，内含链接图标 + 16px 输入 + 主 CTA）、
 * 线路单选胶囊（.lines，键盘可达：真 radio + :focus-visible 描边）、
 * 底部辅助行（.after：线路数 + 示例域名一键填入）。
 * 数字只报「几条线路可用」这种当场可验证的，不放假统计。
 *
 * @param {Array}    interfaces   [{ id, name }] 已按 type 过滤的线路
 * @param {Function} onParse      (url, interfaceObj) => void
 * @param {boolean}  loading      外部解析中（禁用提交）
 * @param {number}   remaining    今日剩余次数（有值才显示）
 * @param {boolean}  quotaExceeded 今日配额用尽
 */
export default function ParseForm({
  interfaces = [],
  onParse,
  loading = false,
  remaining = null,
  quotaExceeded = false,
}) {
  const [url, setUrl] = useState('');
  const [ifaceId, setIfaceId] = useState('');
  const [allLines, setAllLines] = useState(false);
  const [bad, setBad] = useState(false);

  const effectiveId = ifaceId || (interfaces.length ? String(interfaces[0].id) : '');
  const selected = useMemo(
    () => interfaces.find((i) => String(i.id) === effectiveId) || null,
    [interfaces, effectiveId]
  );

  const visibleLines = allLines ? interfaces : interfaces.slice(0, LINE_LIMIT);

  const submit = useCallback(() => {
    const target = url.trim();
    if (!target) {
      setBad(true);
      setTimeout(() => setBad(false), 500);
      return;
    }
    if (!selected || loading) return;
    onParse?.(target, selected);
  }, [url, selected, loading, onParse]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      submit();
    },
    [submit]
  );

  const fill = (value) => {
    setUrl(value);
    setBad(false);
  };

  return (
    <form className="parse" onSubmit={handleSubmit} autoComplete="off">
      <div className={`field${bad ? ' bad' : ''}`}>
        <div className="link">
          <Icon name="link" />
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setBad(false); }}
            inputMode="url"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="视频链接"
            placeholder="粘贴视频播放页链接…"
          />
        </div>
        <button className="btn-cta" type="submit" disabled={loading || !url.trim() || !selected}>
          <Icon name="play" className="fill" />
          <span>{loading ? '解析中…' : '解析播放'}</span>
        </button>
      </div>

      <div className="lines" role="radiogroup" aria-label="解析线路">
        <span className="lines-lbl">线路</span>
        {interfaces.length === 0 && <span className="lines-lbl">暂无可用线路</span>}
        {visibleLines.map((iface) => (
          <label className="ln" key={iface.id}>
            <input
              type="radio"
              name="parse-line"
              value={String(iface.id)}
              checked={String(iface.id) === effectiveId}
              onChange={() => setIfaceId(String(iface.id))}
            />
            <span>{iface.name}</span>
          </label>
        ))}
        {interfaces.length > LINE_LIMIT && (
          <button type="button" className="btn-ghost" onClick={() => setAllLines((v) => !v)}>
            {allLines ? '收起' : `其余 ${interfaces.length - LINE_LIMIT} 条`}
          </button>
        )}
      </div>

      <div className="after">
        <span className="stats">{interfaces.length} 条线路可用</span>
        <span className="dot" />
        <span>试试：</span>
        {['v.qq.com', 'www.iqiyi.com', 'www.youku.com'].map((site) => (
          <button type="button" key={site} onClick={() => fill(`https://${site}/`)}>
            {site}
          </button>
        ))}
      </div>

      {remaining != null && !quotaExceeded && (
        <p className="player-cap">今日剩余 {remaining} 次解析</p>
      )}
      {quotaExceeded && (
        <div className="notice mtop">
          <Icon name="alert" />
          <p>
            <b>今日免费次数已用完。</b>注册或升级会员可以获得更多次数：
            <Link to="/register" className="lnk">免费注册</Link>
            {' / '}
            <Link to="/member" className="lnk">我的会员</Link>
          </p>
        </div>
      )}
    </form>
  );
}
