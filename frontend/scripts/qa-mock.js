/*
 * qa-mock.js — 带数据的结果分支实测（补 qa-sweep 覆盖不到的那一半）
 *
 * 本地没有后端，/api/* 被 vite 的 SPA fallback 兜成 200 + index.html，
 * 所以 /parser 的解析结果、/search 的影片网格这些**真正给用户看的东西**
 * 在前面那一轮 480 次测量里从未渲染过一遍。这个脚本把响应假出来，
 * 让页面走完整的状态机（点击 → loading → 结果），再量同样的指标。
 *
 * 两类拦截：
 *   - VideoParserPage 用原生 fetch()  → 直接替换 iframe 的 window.fetch；
 *   - api/client.js 是 Axios 1.16（adapters/xhr.js 每次请求 new XMLHttpRequest()）
 *     → 补原型即可，实例本身还是真的，'onloadend' in request 为真，
 *       所以假 send 里必须回调 onloadend，并给实例 defineProperty 出
 *       status/responseText（这俩在真 XHR 上是原型上的只读 getter，直接赋值会被吞）。
 *
 * 用法同 qa-sweep：
 *   async () => eval(await (await fetch('/scripts/qa-mock.js')).text() + '\n')
 * 轮询 window.__qaMockJob。
 */
async () => {
  /* qa-color.js 本身是一个「返回工具对象的箭头函数」，eval 出来还是函数，必须再调用一次。
     （第一版忘了这个括号，8 个场景全部栽在 visible is not a function 上。） */
  const C = eval(`${await (await fetch('/scripts/qa-color.js')).text()}`)();
  const { bgOf, visible } = C;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const WIDTHS = [1440, 375];
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2764}]/u;

  let box = document.getElementById('qa-mock');
  if (!box) {
    box = document.createElement('iframe');
    box.id = 'qa-mock';
    box.setAttribute('style', 'position:fixed;right:0;top:0;border:0;z-index:99998;background:#fff');
    document.documentElement.appendChild(box);
  }

  /* ---- 假响应数据：字段照后端契约写，不凭印象编 ---- */
  const SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='320'%3E%3Crect width='240' height='320' fill='%23cdd2d8'/%3E%3C/svg%3E";

  const PARSE_SHORT = {
    success: true,
    remaining: 7,
    data: {
      platform: 'douyin',
      title: '深夜十一点的城市还在运转，拍下这段给还没睡的人。#城市 #夜景',
      author: '@夜行记录',
      thumbnail: SVG,
      formats: [
        { label: '高清无水印 MP4', url: 'https://v.douyin.com/mock/play_hd.mp4' },
        { label: '背景音乐 MP3', url: 'https://v.douyin.com/mock/audio.mp3' },
      ],
    },
  };

  const PARSE_VIP = {
    success: true,
    remaining: 6,
    data: {
      platform: 'vip',
      title: '长安十二时辰 第 1 集',
      playerUrl: 'about:blank',
      /* 三条线路：select 的选中态、切换后的 src 都要能看出来 */
      interfaces: [
        { name: '线路 1 · 极速', url: 'about:blank' },
        { name: '线路 2 · 高清', url: 'about:blank' },
        { name: '线路 3 · 备用', url: 'about:blank' },
      ],
    },
  };

  const SEARCH = {
    success: true,
    data: {
      list: [
        { id: 'a1', name: '长安十二时辰', year: '2019', score: 8.6, cover: '', page_url: 'https://mock/play/1', desc: '张小敬必须在一百九十八时辰之内追回案件真相，否则长安将面临灭顶之灾。' },
        { id: 'a2', name: '即将上线的剧', year: '', score: null, cover: '', page_url: '', desc: '' },
        { id: 'a3', name: '隐秘的角落', year: '2020', score: 9.4, cover: SVG, page_url: 'https://mock/play/3', desc: '三个孩子目睹了一次谋杀。' },
        { id: 'a4', name: '山月不知心底事', year: '2020', score: 6.2, cover: '', page_url: 'https://mock/play/4', desc: '向远和叶骅在时代里各自辗转。' },
        { id: 'a5', name: '漫长的季节', year: '2023', score: 9.5, cover: '', page_url: 'https://mock/play/5', desc: '小城碎尸案横跨十八年。' },
        { id: 'a6', name: '繁花', year: '2023', score: 8.1, cover: '', page_url: 'https://mock/play/6', desc: '上世纪九十年代的上海，阿宝白手起家。' },
      ],
      total: 42, page: 1, page_size: 10, pages: 5,
    },
  };

  /* ---- Axios 走 XHR：补原型 ---- */
  function stubXhr(w, match) {
    const P = w.XMLHttpRequest.prototype;
    P.open = function (m, u) { this.__url = String(u); this.__m = m; };
    P.setRequestHeader = function () {};
    P.overrideMimeType = function () {};
    P.abort = function () {};
    P.send = function () {
      const url = this.__url || '';
      const hit = match(url);
      const body = hit ? JSON.stringify(hit) : { success: false, error: 'mock 未覆盖: ' + url };
      w.setTimeout(() => {
        Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
        Object.defineProperty(this, 'status', { value: hit ? 200 : 404, configurable: true });
        Object.defineProperty(this, 'statusText', { value: hit ? 'OK' : 'Not Found', configurable: true });
        Object.defineProperty(this, 'responseText', { value: body, configurable: true });
        Object.defineProperty(this, 'response', { value: body, configurable: true });
        if (typeof this.onreadystatechange === 'function') this.onreadystatechange({});
        if (typeof this.onloadend === 'function') this.onloadend({});
      }, 0);
    };
  }

  /* ---- VideoParserPage 走原生 fetch ---- */
  function stubFetch(w, match) {
    w.fetch = async (input) => {
      const url = String(typeof input === 'string' ? input : (input && input.url) || '');
      const hit = match(url);
      if (!hit) return { ok: false, status: 404, json: async () => ({ success: false, error: 'mock 未覆盖: ' + url }) };
      return {
        ok: true, status: hit.__status || 200,
        headers: { get: () => null },
        json: async () => { const o = Object.assign({}, hit); delete o.__status; return o; },
      };
    };
  }

  const setNative = (el, value) => {
    const win = el.ownerDocument.defaultView;
    const proto = el.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
    const d = Object.getOwnPropertyDescriptor(proto, 'value');
    d.set.call(el, value);
    el.dispatchEvent(new win.Event('input', { bubbles: true }));
  };

  async function open(route, dark, stub) {
    await new Promise((res, rej) => {
      /* 深色走 localStorage 让 themeMode 开机生效：Header 的开关点击会把 .dark 和
         MUI palette 一起翻，但在没有 Header 的页面上点不到，只剩半套深色。 */
      try { localStorage.setItem('darkMode', dark ? 'true' : 'false'); } catch { /* ignore */ }
      box.src = route;
      const to = setTimeout(() => rej(new Error('load timeout ' + route)), 20000);
      box.onload = () => { clearTimeout(to); res(); };
    });
    const win = box.contentWindow;
    const doc = win.document;
    for (let i = 0; i < 40; i++) {
      const root = doc.getElementById('root');
      if (root && root.children.length) break;
      await sleep(150);
    }
    const st = doc.createElement('style');
    st.textContent = '*{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}';
    doc.documentElement.appendChild(st);
    if (dark && !doc.documentElement.classList.contains('dark')) doc.documentElement.classList.add('dark');
    if (stub) stub(win, doc);
    return { win, doc };
  }

  function measure(win, doc, name, width, dark, expect) {
    const cw = doc.documentElement.clientWidth;
    const out = { name, width, dark, overflow: 0, overflowSample: [], gradients: [], emoji: [], zeroSvg: [], low: [], small: [], missing: [] };
    const dx = doc.documentElement.scrollWidth - cw;
    if (dx > 1) {
      out.overflow = dx;
      for (const el of doc.querySelectorAll('body *')) {
        if (!visible(win, el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right <= cw + 1) continue;
        let scroller = false;
        for (let a = el; a && a !== doc.body; a = a.parentElement) {
          const ox = win.getComputedStyle(a).overflowX;
          if (ox === 'auto' || ox === 'scroll') { scroller = true; break; }
        }
        if (scroller) continue;
        out.overflowSample.push(el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 50) + ' +' + Math.round(r.right - cw) + 'px');
        if (out.overflowSample.length >= 3) break;
      }
    }
    for (const el of doc.querySelectorAll('*')) {
      if (!visible(win, el)) continue;
      if (/gradient/.test(win.getComputedStyle(el).backgroundImage)) out.gradients.push(el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 40));
      const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (own && EMOJI.test(own) && /^(BUTTON|A|LABEL|H[1-4])$/.test(el.tagName)) out.emoji.push(el.tagName.toLowerCase() + ': ' + own.slice(0, 24));
      if (el.tagName === 'svg' || el.tagName === 'SVG') { if (el.getBoundingClientRect().width < 2) out.zeroSvg.push((el.getAttribute('class') || '') + ' | in ' + (el.parentElement ? el.parentElement.tagName.toLowerCase() : '?')); }
    }
    for (const el of doc.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, button, div, option')) {
      if (!visible(win, el)) continue;
      const txt = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (txt.length < 2) continue;
      const cs = win.getComputedStyle(el);
      const bg = bgOf(win, el);
      if (bg.complex) continue;
      if (C.parse(cs.color).a < 1) continue;
      const need = C.needFor(cs);
      const r = C.ratio(C.fgOf(win, el, bg), bg);
      if (r < need - 0.01) out.low.push(el.tagName.toLowerCase() + ' ' + r.toFixed(2) + '<' + need + ' fs' + parseFloat(cs.fontSize) + ' "' + txt.slice(0, 18) + '"');
    }
    for (const el of doc.querySelectorAll('button, a[href], input:not([type=hidden]), select')) {
      if (!visible(win, el)) continue;
      const host = (el.tagName === 'INPUT' && el.type !== 'text' && el.closest('label')) || el;
      if (win.getComputedStyle(host).display === 'inline') continue; /* WCAG 2.5.8 行内目标豁免 */
      const r = host.getBoundingClientRect();
      if (r.height < 24 || r.width < 24) out.small.push(el.tagName.toLowerCase() + (host === el ? '' : '/label') + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (host.textContent || '').trim().slice(0, 12) + '"');
    }
    /* 断言：这些文案必须真的出现在页面上，否则说明分支根本没跑到，
       上面所有测量都测的是空态 —— 这是最容易骗过自己的一种方式。 */
    const all = doc.body.textContent || '';
    for (const s of expect) if (!all.includes(s)) out.missing.push(s);
    for (const k of ['gradients', 'emoji', 'zeroSvg', 'low', 'small']) out[k] = Array.from(new Set(out[k])).slice(0, 4);
    return out;
  }

  const SCENES = [
    {
      name: 'parser/短视频',
      route: '/parser',
      stub: (w) => stubFetch(w, (u) => (u.includes('/api/video/parse') ? PARSE_SHORT : null)),
      drive: async (doc) => {
        const input = doc.querySelector('main input[type=text]');
        setNative(input, 'https://v.douyin.com/mock/');
        await sleep(60);
        [...doc.querySelectorAll('button')].find((b) => b.textContent.includes('解析')).click();
        await sleep(500);
      },
      expect: ['今日剩余 7 次', '视频文案', '高清无水印 MP4', '背景音乐 MP3', '下载'],
    },
    {
      name: 'parser/长视频线路',
      route: '/parser',
      stub: (w) => stubFetch(w, (u) => (u.includes('/api/video/parse') ? PARSE_VIP : null)),
      drive: async (doc) => {
        const input = doc.querySelector('main input[type=text]');
        setNative(input, 'https://v.youku.com_mock/');
        await sleep(60);
        [...doc.querySelectorAll('button')].find((b) => b.textContent.includes('解析')).click();
        await sleep(500);
      },
      expect: ['解析线路', '线路 1 · 极速', '线路 2 · 高清'],
    },
    {
      name: 'parser/配额用尽',
      route: '/parser',
      stub: (w) => stubFetch(w, (u) => (u.includes('/api/video/parse') ? { __status: 429, success: false, error: 'quota' } : null)),
      drive: async (doc) => {
        const input = doc.querySelector('main input[type=text]');
        setNative(input, 'https://v.douyin.com/mock/');
        await sleep(60);
        [...doc.querySelectorAll('button')].find((b) => b.textContent.includes('解析')).click();
        await sleep(500);
      },
      expect: ['今日免费次数已用完', '免费注册', '我的会员'],
    },
    {
      name: 'search/结果网格',
      route: '/search',
      stub: (w) => stubXhr(w, (u) => (u.includes('/api/search') ? SEARCH : null)),
      drive: async (doc) => {
        const input = doc.querySelector('main input');
        setNative(input, '长安');
        await sleep(60);
        const btn = [...doc.querySelectorAll('button')].find((b) => /搜索|查询/.test(b.textContent));
        if (btn) btn.click(); else input.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await sleep(700);
      },
      expect: ['长安十二时辰', '8.6 分', '暂无播放页', '漫长的季节', '下一页'],
    },
  ];

  const job = { done: false, i: 0, total: SCENES.length * 4, results: [], errors: [] };
  window.__qaMockJob = job;

  let prevDark = null;
  try { prevDark = localStorage.getItem('darkMode'); } catch { /* ignore */ }

  (async () => {
    for (const sc of SCENES) {
      for (const dark of [false, true]) {
        try {
          const { win, doc } = await open(sc.route, dark, sc.stub);
          await sc.drive(doc);
          for (const w of WIDTHS) {
            box.style.width = w + 'px';
            box.style.height = '900px';
            await sleep(90);
            job.results.push(measure(win, doc, sc.name, w, dark, sc.expect));
            job.i++;
          }
        } catch (e) {
          job.errors.push(sc.name + ' :: ' + e.message);
          job.i++;
        }
      }
    }
    box.style.width = '0px';
    try {
      if (prevDark === null) localStorage.removeItem('darkMode');
      else localStorage.setItem('darkMode', prevDark);
    } catch { /* ignore */ }
    job.done = true;
  })();

  return 'mock job started: ' + SCENES.length + ' 场景 x 2 主题 x 2 视口';
}
