/*
 * qa-sweep.js — 全站 iframe 实测脚本（设计系统的验收探针）
 *
 * 用法（浏览器 MCP）：把下面这段作为 evaluate_script 的 function 执行，
 * 脚本自己从 dev server 拉本文件，改完刷新即可重跑，不用复制粘贴：
 *
 *   async () => eval(await (await fetch('/scripts/qa-sweep.js')).text())
 *
 * 结果轮询：window.__qaJob（{done,i,total,results,errors}）。
 * 单次 evaluate 约 15s 超时，所以真正的循环是不 await 的后台任务。
 *
 * 为什么不用截图下结论：拿不到稳定截图通道时，"看起来没问题"不算验收。
 * 这里把被测页装进**同源** iframe，用固定视口宽度真实排版，然后量出数字：
 * 横向溢出、装饰性渐变、emoji 当图标、0 宽的 SVG、文字对比度、触控目标尺寸。
 *
 * 四个坑（都踩过一次）：
 *  1. iframe 必须挂在 documentElement 而不是 body —— 宿主页也是同一个 SPA，
 *     React 接管时会清掉 document.body，探针挂上去会一起被删。
 *  2. 注入 transition:none：换肤/悬停动画中途取到的是插值色，
 *     量出来的对比度不可复现。
 *  3. 深色必须走 localStorage 让 themeMode 开机就生效，不能只往 <html> 加 .dark：
 *     CSS 变量翻了而 MUI 的 JS palette 没翻，半深半浅的页面会报出 1.11:1 这种
 *     根本不存在的故障（/login 这类没有 Header 开关的页尤其明显）。
 *  4. 滚动动画要在注入样式里一并揭示：探针不滚动，.reveal 以下的内容一直停在
 *     opacity:0 —— 上一轮 480 次测量其实只覆盖了首屏，量到的「没问题」是半真半假的。
 *
 * 工具路由清单在 qa-toolkeys.txt（从 ToolDetailPage 的注册表导出），
 * 新增工具只要更新那个文件，这里自动跟着跑。
 */
async () => {
  const TOOLS = (await (await fetch('/qa-toolkeys.txt')).text()).trim().split(/\s+/);
  const PAGES = ['/', '/music', '/meme', '/maker', '/parser', '/search', '/m3u8', '/mp4', '/hot',
    '/tools', '/screen-recorder', '/ai', '/about', '/privacy-policy', '/terms', '/contact',
    '/recommend', '/articles', '/mbti', '/tests', '/memes', '/visitors', '/submissions',
    '/click-events', '/parse-records', '/m3u8-records', '/tool-usage', '/push', '/login',
    '/register', '/member'];
  const ROUTES = PAGES.concat(TOOLS.map((t) => '/tools/' + t));
  const WIDTHS = [1440, 375];
  /* 图标位上不该出现字符：杂项符号、变体选择符、箭头、装饰几何块、❤ */
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2764}]/u;

  /* 对比度数学全站只有一份实现（scripts/qa-color.js），这里 fetch 进来用。
     早期版本在 sweep 脚本里就地写过一遍，算错过一次（不透明祖先覆盖前景，
     每个文字节点和自己比），两份拷贝最容易出的就是这个错。 */
  const C = eval(`${await (await fetch('/scripts/qa-color.js')).text()}`)();
  const { bgOf, visible } = C;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let box = document.getElementById('qa-box');
  if (!box) {
    box = document.createElement('iframe');
    box.id = 'qa-box';
    box.setAttribute('style', 'position:fixed;left:0;top:0;border:0;z-index:99999;background:#fff');
    document.documentElement.appendChild(box);
  }

  function measure(win, doc, route, width, dark) {
    const cw = doc.documentElement.clientWidth;
    const out = { route, width, dark, overflow: 0, overflowSample: [], gradients: [], emoji: [], zeroSvg: [], low: [], small: [] };

    const dx = doc.documentElement.scrollWidth - cw;
    if (dx > 1) {
      out.overflow = dx;
      for (const el of doc.querySelectorAll('body *')) {
        if (!visible(win, el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right <= cw + 1) continue;
        /* 自己或某个祖先是横向滚动容器（移动端顶栏导航、表格、代码块）：
           里面的内容超出视口是设计的一部分，document.scrollWidth 也不会被它顶开。 */
        let scroller = false;
        for (let a = el; a && a !== doc.body; a = a.parentElement) {
          const ox = win.getComputedStyle(a).overflowX;
          if (ox === 'auto' || ox === 'scroll') { scroller = true; break; }
        }
        if (scroller) continue;
        if (el.scrollWidth > cw + 1 && el.clientWidth <= cw + 1) continue;
        out.overflowSample.push(el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 50) + ' +' + Math.round(r.right - cw) + 'px');
        if (out.overflowSample.length >= 3) break;
      }
    }

    for (const el of doc.querySelectorAll('*')) {
      if (!visible(win, el)) continue;
      if (/gradient/.test(win.getComputedStyle(el).backgroundImage)) {
        out.gradients.push(el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 40));
      }
    }

    for (const el of doc.querySelectorAll('button, a, label, h1, h2, h3, h4, span, div')) {
      if (!visible(win, el)) continue;
      const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (own && EMOJI.test(own)) out.emoji.push(el.tagName.toLowerCase() + ': ' + own.slice(0, 24));
    }

    for (const svg of doc.querySelectorAll('svg')) {
      if (!visible(win, svg)) continue;
      if (svg.getBoundingClientRect().width < 2) {
        out.zeroSvg.push(((svg.getAttribute && svg.getAttribute('class')) || '') + ' | in ' + (svg.parentElement ? svg.parentElement.tagName.toLowerCase() : '?'));
      }
    }

    for (const el of doc.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, button, div, dt, dd, option')) {
      if (!visible(win, el)) continue;
      const txt = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (txt.length < 2) continue;
      const cs = win.getComputedStyle(el);
      const bg = bgOf(win, el);
      if (bg.complex) continue;
      const raw = C.parse(cs.color);
      if (raw.a < 1) continue; /* 半透明文字只有 scrim 那类用法，跳过 */
      const fs = parseFloat(cs.fontSize);
      const need = C.needFor(cs);
      const r = C.ratio(C.fgOf(win, el, bg), bg);
      if (r < need - 0.01) out.low.push(el.tagName.toLowerCase() + ' ' + r.toFixed(2) + '<' + need + ' fs' + fs + ' "' + txt.slice(0, 18) + '"');
    }

    for (const el of doc.querySelectorAll('button, a[href], input:not([type=hidden]), select, [role=button]')) {
      if (!visible(win, el)) continue;
      /* 勾选框/单选的真正可点区域是包住它的 <label>（点标签文字也会切换），
         按 16px 的 input 本体判定会误报一片。量包裹 label，量不到再退回复选框本体。 */
      const host = (el.tagName === 'INPUT' && el.type !== 'text' && el.closest('label')) || el;
      /* WCAG 2.5.8 对「正文行内的目标」有明确豁免：夹在句子里的链接不该被拉成块，
         渲染后的 markdown / 文章正文里的 <a> 就是这一类，按块级标准判会一直误报。 */
      if (win.getComputedStyle(host).display === 'inline') continue;
      const r = host.getBoundingClientRect();
      if (r.height < 24 || r.width < 24) {
        out.small.push(el.tagName.toLowerCase() + (host === el ? '' : '/label') + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (host.textContent || el.value || '').trim().slice(0, 12) + '"');
      }
    }

    /* 只回传计数 + 4 条样本，否则结果集大到没法轮询；
       计数单独留一份全量，不然是「只看得到前 4 条」却以为整页只有 4 条问题。 */
    for (const k of ['gradients', 'emoji', 'zeroSvg', 'low', 'small']) {
      const u = Array.from(new Set(out[k]));
      out[k + 'Count'] = u.length;
      out[k] = u.slice(0, 4);
    }
    return out;
  }

  async function load(route, dark) {
    return new Promise((resolve, reject) => {
      /* 深色靠 localStorage 驱动，不再点击 Header 的开关：
         /login /member /register 这些页面没有 Header，点不到开关，旧代码退化成
         只往 <html> 加 .dark —— CSS 变量翻了、MUI 的 JS palette 没翻，
         于是量出「深色文字压浅色 Paper」这种 1.11:1 的假故障。
         iframe 与宿主页同源，直接写 key，themeMode 开机就按真状态把两套材质一起翻。 */
      try { localStorage.setItem('darkMode', dark ? 'true' : 'false'); } catch { /* 隐私模式：下面还有一条 class 兜底 */ }
      box.src = route;
      const to = setTimeout(() => reject(new Error('load timeout')), 20000);
      box.onload = async () => {
        clearTimeout(to);
        let win, doc;
        try {
          win = box.contentWindow; doc = win.document;
          for (let i = 0; i < 40; i++) {
            const root = doc.getElementById('root');
            if (root && root.children.length) break;
            await sleep(150);
          }
          /* 两条注入：
             1) 关掉过渡/动画 —— 换肤、悬停中途取到的是插值色，数字不可复现；
             2) 强制揭示 .reveal —— 探针不滚动，滚动动画以下的整屏内容会一直停在
                opacity:0，等于根本没被量过（上一轮 / 首页只有首屏进过对比度检查）。 */
          const st = doc.createElement('style');
          st.textContent = '*{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}';
          doc.documentElement.appendChild(st);
          if (dark && !doc.documentElement.classList.contains('dark')) doc.documentElement.classList.add('dark');
          await sleep(60);
          resolve({ win, doc });
        } catch (e) { reject(e); }
      };
      box.onerror = () => { clearTimeout(to); reject(new Error('load error')); };
    });
  }

  const job = { done: false, i: 0, total: ROUTES.length, results: [], errors: [], startedAt: Date.now() };
  window.__qaJob = job;

  /* 探针会反复改写 darkMode 这个 key，跑完按原样还回去（原来是跟随系统就删掉 key）。 */
  let prevDark = null;
  try { prevDark = localStorage.getItem('darkMode'); } catch { /* ignore */ }

  (async () => {
    for (const route of ROUTES) {
      try {
        for (const dark of [false, true]) {
          const { win, doc } = await load(route, dark);
          for (const w of WIDTHS) {
            box.style.width = w + 'px';
            box.style.height = '900px';
            await sleep(80);
            job.results.push(measure(win, doc, route, w, dark));
          }
        }
      } catch (e) {
        job.errors.push(route + ' :: ' + e.message);
      }
      job.i++;
    }
    box.style.width = '0px';
    try {
      if (prevDark === null) localStorage.removeItem('darkMode');
      else localStorage.setItem('darkMode', prevDark);
    } catch { /* ignore */ }
    job.done = true;
    job.finishedAt = Date.now();
  })();

  return 'job started: ' + ROUTES.length + ' routes x 2 themes x 2 widths = ' + ROUTES.length * 4 + ' measurements';
}
