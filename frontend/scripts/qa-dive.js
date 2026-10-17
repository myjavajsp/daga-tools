/*
 * qa-dive.js — 单页对比度/触控目标的全量取证（qa-sweep 只回传 4 条样本，不够定位）
 *
 * 用法（浏览器 MCP，宿主页上执行）：
 *   async () => eval(await (await fetch('/scripts/qa-dive.js?ts=' + Date.now(), {cache:'no-store'})).text() + '\n')
 * 配置写在 window.__qaDiveCfg = [{route:'/login', dark:true}, ...]，
 * 结果轮询 window.__qaDiveJob = {done,i,results:[{route,dark,low:[…],small:[…]}]}。
 *
 * 每条低对比记录都带上「算式的全部输入」：自身 color、祖先背景链、祖先 opacity 链、
 * 字号字重。1.00 这种数字要么是白字压白底（真 bug），要么是探针自己找错了底 ——
 * 只有把链路打出来才分得清，靠调阈值是把问题藏起来。
 */
async () => {
  const cfg = window.__qaDiveCfg || [{ route: '/', dark: false }];
  const C = eval(`${await (await fetch('/scripts/qa-color.js?ts=' + Date.now())).text()}`)();
  const { bgOf, visible } = C;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let box = document.getElementById('qa-dive');
  if (!box) {
    box = document.createElement('iframe');
    box.id = 'qa-dive';
    box.setAttribute('style', 'position:fixed;left:0;top:0;border:0;z-index:99997;background:#fff');
    document.documentElement.appendChild(box);
  }

  async function load(route, dark) {
    return new Promise((resolve, reject) => {
      /* 深色靠 localStorage 驱动（同 qa-sweep 的第 3 条坑）：只加 .dark 类只会翻 CSS 变量，
         MUI 的 palette 还停在浅色，量出来是假故障。 */
      try { localStorage.setItem('darkMode', dark ? 'true' : 'false'); } catch { /* ignore */ }
      box.src = route;
      const to = setTimeout(() => reject(new Error('load timeout')), 20000);
      box.onload = async () => {
        clearTimeout(to);
        const win = box.contentWindow, doc = win.document;
        for (let i = 0; i < 40; i++) {
          const root = doc.getElementById('root');
          if (root && root.children.length) break;
          await sleep(150);
        }
        const st = doc.createElement('style');
        st.textContent = '*{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}';
        doc.documentElement.appendChild(st);
        if (dark && !doc.documentElement.classList.contains('dark')) doc.documentElement.classList.add('dark');
        resolve({ win, doc });
      };
      box.onerror = () => { clearTimeout(to); reject(new Error('load error')); };
    });
  }

  const chain = (win, el) => {
    const out = [];
    let node = el;
    while (node && node.nodeType === 1 && out.length < 12) {
      const cs = win.getComputedStyle(node);
      out.push({
        t: node.tagName.toLowerCase(),
        c: (node.getAttribute('class') || '').slice(0, 60),
        bg: cs.backgroundColor,
        bi: cs.backgroundImage === 'none' ? '' : 'IMG',
        op: cs.opacity === '1' ? '' : cs.opacity,
        disp: cs.display === 'none' ? 'NONE' : (cs.visibility === 'hidden' ? 'HID' : ''),
        pos: cs.position === 'static' ? '' : cs.position,
      });
      node = node.parentElement;
    }
    return out;
  };

  const job = { done: false, i: 0, total: cfg.length * 2, results: [], errors: [] };
  window.__qaDiveJob = job;

  (async () => {
    for (const w of [1440, 375]) {
      for (const sc of cfg) {
        try {
          box.style.width = w + 'px';
          box.style.height = '900px';
          const { win, doc } = await load(sc.route, sc.dark);
          const low = [];
          for (const el of doc.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, button, div, dt, dd, option')) {
            if (!visible(win, el)) continue;
            const txt = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
            if (txt.length < 2) continue;
            const cs = win.getComputedStyle(el);
            const bg = bgOf(win, el);
            if (bg.complex) continue;
            if (C.parse(cs.color).a < 1) continue;
            const need = C.needFor(cs);
            const fg = C.fgOf(win, el, bg);
            const r = C.ratio(fg, bg);
            if (r < need - 0.01) {
              low.push({
                txt: txt.slice(0, 16),
                tag: el.tagName.toLowerCase(),
                cls: (el.getAttribute('class') || '').slice(0, 70),
                fs: cs.fontSize, fw: cs.fontWeight,
                color: cs.color, fg: `rgb(${fg.r.toFixed(0)},${fg.g.toFixed(0)},${fg.b.toFixed(0)})`,
                bg: `rgb(${bg.r.toFixed(0)},${bg.g.toFixed(0)},${bg.b.toFixed(0)})`,
                ratio: +r.toFixed(2), need, rect: el.getBoundingClientRect().toJSON(),
                chain: chain(win, el),
              });
            }
          }
          const small = [];
          for (const el of doc.querySelectorAll('button, a[href], input:not([type=hidden]), select, [role=button]')) {
            if (!visible(win, el)) continue;
            const host = (el.tagName === 'INPUT' && el.type !== 'text' && el.closest('label')) || el;
            const r = host.getBoundingClientRect();
            if (r.height < 24 || r.width < 24) {
              small.push({
                tag: el.tagName.toLowerCase(), host: host.tagName.toLowerCase(),
                cls: (host.getAttribute('class') || '').slice(0, 70),
                txt: (host.textContent || el.value || '').trim().slice(0, 16),
                w: Math.round(r.width), h: Math.round(r.height),
                disp: win.getComputedStyle(host).display, line: win.getComputedStyle(host).lineHeight,
              });
            }
          }
          job.results.push({ route: sc.route, dark: !!sc.dark, width: w, low, small });
        } catch (e) {
          job.errors.push(sc.route + ' d' + (+!!sc.dark) + ' ' + w + ' :: ' + e.message);
        }
        job.i++;
      }
    }
    box.style.width = '0px';
    job.done = true;
  })();

  return 'dive started: ' + cfg.length + ' 场景 x 2 视口';
}
