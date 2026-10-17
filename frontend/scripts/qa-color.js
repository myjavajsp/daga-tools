/*
 * qa-color.js — 对比度计算的唯一实现（被 qa-sweep.js / qa-mock.js 共用）
 *
 * 为什么单独一个文件：第一版探针的对比度算是错的 —— 合成背景时让不透明的祖先
 * 覆盖了前景，结果每个文字节点都在和自己比，一次报出 34~141 个"低对比"，全是假警报。
 * 这套数学是整个验收的地基，两处各抄一份迟早会漂开，所以抽成一份，运行时 fetch 进来。
 *
 * 用法（在页面里）：
 *   const C = await eval(await (await fetch('/scripts/qa-color.js')).text());
 *   const bg = C.bgOf(win, el); if (!bg.complex) C.ratio(C.fgOn(cs, bg), bg);
 */
() => {
  const parse = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return { r: 0, g: 0, b: 0, a: 0 };
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0] || 0, g: p[1] || 0, b: p[2] || 0, a: p.length >= 4 ? p[3] : 1 };
  };

  /* fg 合成到 bg 上（bg 必须不透明） */
  const over = (fg, bg) => {
    const a = fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
  };

  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };

  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  /* 背景 = 往上找到第一层不透明底，中间半透明层自下而上合成。
     碰到 gradient 判 complex 直接跳过：渐变底上没有稳定的对比度答案，
     硬算只会产出看着像 bug 的数字。 */
  function bgOf(win, el) {
    const stack = [];
    let node = el;
    let opaque = null;
    while (node && node.nodeType === 1) {
      const cs = win.getComputedStyle(node);
      if (/gradient/.test(cs.backgroundImage)) return { complex: true };
      const c = parse(cs.backgroundColor);
      if (c.a === 1) { opaque = c; break; }
      if (c.a > 0) stack.push(c);
      node = node.parentElement;
    }
    let out = opaque || { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) out = over(stack[i], out);
    return out;
  }

  /* 前景：CSS 颜色自带的 alpha 合成到底上；祖先整块 opacity 也要乘进去
     （.btn-a:disabled 的淡出就是这么把文字压没的）。 */
  function fgOf(win, el, bg) {
    let c = parse(win.getComputedStyle(el).color);
    let alpha = c.a;
    let node = el;
    while (node && node.nodeType === 1) {
      const o = parseFloat(win.getComputedStyle(node).opacity);
      if (!Number.isNaN(o)) alpha *= o;
      node = node.parentElement;
    }
    c = { r: c.r, g: c.g, b: c.b, a: alpha };
    return over(c, bg);
  }

  /* 可见 = 自己没被 display/visibility/opacity 关掉，**祖先链也没把整块抹掉**。
     后一半是补出来的：首页的 .reveal 在滚动前是 opacity:0，元素自己的 opacity 却是 1，
     只查本体的话这些「用户根本还没看见」的节点会被当成可见，
     fgOf 又把祖先的 0 乘进前景，于是量出来一片 ratio=1.00 的假低对比。 */
  function visible(win, el) {
    const r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return false;
    let eff = 1;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const cs = win.getComputedStyle(node);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const o = parseFloat(cs.opacity);
      if (!Number.isNaN(o)) eff *= o;
      if (eff < 0.02) return false;
    }
    return true;
  }

  /* WCAG：正文 4.5:1；大号字（≥24px，或 ≥18.66px 且字重≥700）放宽到 3:1 */
  function needFor(css) {
    const fs = parseFloat(css.fontSize);
    const bold = +css.fontWeight >= 700;
    return (fs >= 24 || (fs >= 18.66 && bold)) ? 3 : 4.5;
  }

  return { parse, over, lum, ratio, bgOf, fgOf, visible, needFor };
}
