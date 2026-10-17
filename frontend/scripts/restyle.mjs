/**
 * restyle.mjs — 把「明亮清爽 v5」材质下沉到内页的可复核换肤脚本
 *
 * 用法：
 *   node scripts/restyle.mjs            # dry-run，只报命中数
 *   node scripts/restyle.mjs --write    # 真正落盘
 *
 * 为什么是脚本而不是手工 90 个文件：
 *   内页的重复度极高（同一条 class 串在 40+ 个文件里逐字出现），
 *   脚本能保证同一规则全站一次改齐、且规则表本身就是这次换肤的评审文档。
 *
 * 安全边界（重要）：
 *   1. 只在 className 的引号字符串内部动手，不碰 JS 逻辑、不碰文案；
 *   2. 只处理「中性色 + dark: 变体」这类可证明等价的替换；
 *   3. 渐变、text-white、内联 style 一律不自动改 —— 那些要看语义，
 *      脚本只把它们列进 REPORT 交给人处理（白字压强调底 vs 压缩略图黑底，改法完全不同）。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIRS = ['src/pages', 'src/components'];
const SKIP_DIRS = ['admin', 'home']; // 后台单独处理；home 已经是新材质

const WRITE = process.argv.includes('--write');

/* ---------- 1. 整串替换（先做，命中率高且语义明确） ---------- */
const WHOLE = [
  // 页面底：旧深色页
  ['min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center', 'min-h-screen bg-paper flex items-center justify-center'],
  ['min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900', 'min-h-screen bg-paper'],
  ['min-h-screen bg-gray-900 flex items-center justify-center', 'min-h-screen bg-paper flex items-center justify-center'],
  ['min-h-screen bg-gray-900', 'min-h-screen bg-paper'],
  ['min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors', 'min-h-screen bg-paper'],
  ['min-h-screen bg-gray-50 dark:bg-gray-900', 'min-h-screen bg-paper'],
  // 容器：统一收到 .wrap（1140 + 安全边距），和首页同一个对齐基准
  ['container mx-auto px-4 py-12', 'wrap py-12'],
  ['container mx-auto px-4 py-8', 'wrap py-8'],
  ['container mx-auto px-4 py-6', 'wrap py-6'],
  ['container mx-auto px-4 py-8 max-w-4xl', 'wrap py-8 max-w-4xl'],
  // 深色页里的卡片
  ['bg-gray-800 rounded-xl p-8 space-y-6', 'card p-8 space-y-6'],
  ['bg-gray-800 rounded-xl p-6 flex justify-between items-center', 'card p-6 flex justify-between items-center'],
  ['bg-gray-800 rounded-xl p-8 text-center', 'card p-8 text-center'],
  ['bg-gray-800 rounded-xl p-8', 'card p-8'],
  ['bg-gray-800 rounded-xl p-6', 'card p-6'],
  ['bg-gray-800 rounded-xl p-5', 'card p-5'],
  ['mt-8 bg-gray-800 rounded-xl p-6', 'mt-8 card p-6'],
  ['aspect-square bg-gray-800 rounded-lg flex items-center justify-center', 'aspect-square card flex items-center justify-center'],
  ['block bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors', 'block card p-6 hover:border-accent transition-colors'],
  ['bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer', 'card p-6 hover:border-accent transition-colors cursor-pointer'],
  // 标题与正文（深色页的白字 → 墨字）
  ['text-2xl font-bold text-white mb-6', 'text-2xl font-bold text-ink mb-6'],
  ['text-4xl font-bold text-white mb-8 text-center', 'text-4xl font-bold text-ink mb-8 text-center'],
  ['text-xl font-semibold text-white mb-3', 'text-xl font-semibold text-ink mb-3'],
];

/* ---------- 2. 单 token 替换（中性色一律走语义 token） ---------- */
const TOKEN = {
  'bg-white': 'bg-surface',
  'bg-gray-50': 'bg-paper',
  'bg-gray-100': 'bg-surface-2',
  'bg-gray-200': 'bg-surface-2',
  'bg-gray-300': 'bg-line-2',
  'hover:bg-gray-100': 'hover:bg-surface-2',
  'hover:bg-gray-200': 'hover:bg-surface-2',
  'border-gray-200': 'border-line',
  'border-gray-300': 'border-line-2',
  'border-gray-100': 'border-line',
  'border-gray-600': 'border-line-2',
  'border-gray-700': 'border-line-2',
  'divide-gray-200': 'divide-line',
  'text-gray-900': 'text-ink',
  'text-gray-800': 'text-ink',
  'text-gray-700': 'text-ink-2',
  'text-gray-600': 'text-ink-2',
  'text-gray-500': 'text-ink-3',
  'text-gray-400': 'text-ink-3',
  'hover:text-gray-900': 'hover:text-ink',
  'hover:text-gray-700': 'hover:text-ink',
  'placeholder-gray-400': 'placeholder:text-ink-3',
  'placeholder-gray-500': 'placeholder:text-ink-3',
  'ring-gray-300': 'ring-line-2',
  'bg-blue-50': 'bg-accent-soft',
  'text-blue-500': 'text-accent',
  'text-blue-600': 'text-accent',
  'hover:text-blue-600': 'hover:text-accent',
  'hover:border-blue-300': 'hover:border-accent',
  'border-blue-200': 'border-line',
  'text-red-600': 'text-danger',
  'bg-red-50': 'bg-danger-soft',
  'border-red-200': 'border-line',
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'bg-green-50': 'bg-success-soft',
  'border-green-200': 'border-line',
  'text-yellow-600': 'text-warning',
  'bg-yellow-50': 'bg-warning-soft',
};

/* ================= 第二遍：渐变 / 饱和色 / text-white =================
   第一遍只管「可证明等价的中性色」。剩下这些要按「语义族」折叠：
   渐变一律拆平（设计规则：全站 0 渐变），彩色一律归到 强调 / 成功 / 危险 / 警告 四族，
   白字看它压的是哪种底 —— 强调底换 --accent-fg（深色模式里它是墨色），
   纸面底换 text-ink，图片遮罩里的白字保持原样。 */

/* 渐变曾经是「整文件豁免」，但那样连文件里的按钮一起漏了（ImageCrop 的 CTA 就是这么留下的）。
   改成不豁免：产品输出和功能性图形都是 inline style / background-image，
   里面的字符串过不了 isClassString（没有 class 前缀、带 ( ) % #），天然不会被当成 class 串改动。
   唯一还留着的渐变是视频标题上的黑色遮罩（bg-gradient-to-t from-black/80）—— 那是可读性，不是装饰。 */
const KEEP_GRADIENT_FILES = [];
/* 阅读主题卡的四张纸（light/sepia/dark）是数据配色，不参与换肤 */
const KEEP_COLORS_FILES = ['src/components/tools/NovelReader.jsx'];

const HUE = {
  blue: 'accent', sky: 'accent', indigo: 'accent', violet: 'accent', purple: 'accent',
  fuchsia: 'accent', brand: 'accent', pink: 'accent',
  green: 'success', emerald: 'success', teal: 'success', lime: 'success',
  red: 'danger', rose: 'danger',
  amber: 'warning', yellow: 'warning', orange: 'warning',
};

/* from- / to- / via- 只有在同一串里出现 ≥2 个时才可能是「一个渐变」；
   单个 from-*（列表第一项那种）是别的东西，不动。 */
const isStop = (t) => /^(?:[a-z-]+:)*(?:from|via|to)-[a-z0-9]+-\d{2,3}(?:\/\d{1,3})?$/.test(t);
/* Tailwind 的方向是 to-r / to-br / to-tl…（b 和 r 之间没有连字符），别写成 to-[trbl] */
const isGradientDir = (t) => /^(?:[a-z-]+:)*bg-gradient-to-[trbl]{1,2}$/.test(t);
const isClipText = (t) => t === 'bg-clip-text' || t === 'text-transparent';
/* 落在图片/视频上的遮罩白字：功能件，保留 */
const SCRIM_BG = /^(?:[a-z-]+:)*bg-black\/\d+$/;

function splitVariant(t) {
  const m = t.match(/^(?:[a-z-]+:)*/)[0];
  return [m, t.slice(m.length)];
}

/* 单个彩色 token → 语义 token。返回 null 表示这个 token 直接删掉。 */
function mapColorToken(t) {
  const [pre, base] = splitVariant(t);
  /* bg-white/60 这类半透明纸面：深色模式里没有 60% 的白，换成中性面板底 */
  if (/^bg-white(?:\/\d+)?$/.test(base)) return pre + (base.includes('/') ? 'bg-surface-2' : 'bg-surface');
  /* 半透明黑 = 图片/视频上的遮罩，是中性功能色，保留 */
  if (/^bg-black\/\d+$/.test(base)) return t;
  /* 第一遍把 border-red-200 换成了 border-danger-soft —— 和底同色，边框等于隐形（58 处）。
     语义横幅的描边一律回中性发丝线，材质才和 .card 一致。 */
  if (/^(border|divide)-(accent|success|danger|warning)-soft$/.test(base)) return pre + (base.startsWith('divide') ? 'divide-line' : 'border-line');
  let m = base.match(/^(bg|text|border|ring|divide|shadow|placeholder)-(gray|slate|zinc|neutral)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (m) {
    const [, prop, , bandRaw, alpha] = m;
    const band = +bandRaw;
    switch (prop) {
      case 'bg':
        if (band >= 900) return pre + 'bg-ink';
        if (band >= 700) return pre + 'bg-surface-2';
        if (band >= 300) return pre + 'bg-surface-2';
        if (band >= 100) return pre + 'bg-surface-2';
        return pre + 'bg-paper';
      case 'text':
        return pre + (band >= 700 ? 'text-ink' : band >= 500 ? 'text-ink-2' : 'text-ink-3');
      case 'border':
        return pre + (band <= 300 ? 'border-line' : 'border-line-2');
      case 'divide':
        return pre + (band <= 300 ? 'divide-line' : 'divide-line-2');
      case 'ring':
        return pre + 'ring-line-2';
      case 'placeholder':
        return pre + 'placeholder:text-ink-3';
      case 'shadow':
        return null;
      default:
        return t;
    }
  }
  m = base.match(/^(bg|text|border|ring|divide|shadow|from|via|to)-(brand|blue|sky|indigo|violet|purple|fuchsia|pink|rose|red|orange|amber|yellow|lime|green|emerald|teal|cyan)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (!m) return t;
  const [, prop, hue, bandRaw] = m;
  const band = +bandRaw;
  const sem = HUE[hue];
  switch (prop) {
    case 'bg':
      if (band <= 200) return pre + `bg-${sem}-soft`;
      if (pre.startsWith('hover:') || pre.startsWith('focus:')) return pre + `bg-${sem}-press`;
      return pre + `bg-${sem}`;
    case 'text':
      return pre + `text-${sem}`;
    case 'border':
      /* soft 底配 soft 边框等于隐形（第一遍踩过这个坑）→ 描边一律回中性发丝线 */
      return pre + (band <= 300 ? 'border-line' : `border-${sem}`);
    case 'ring':
      /* focus 光环要的是「一圈淡强调」，soft 实色太抢眼；accent 有 soft，其它族借用 */
      return pre + (sem === 'accent' ? 'ring-accent-soft' : 'ring-line-2');
    case 'divide':
      return pre + 'divide-line';
    case 'shadow':
      return null; // 彩色投影 = 光斑，设计规则禁止
    default:
      return t; // from/via/to 交给渐变分支处理
  }
}

const SHADOW_MAP = {
  'shadow-md': 'shadow-card', 'shadow-lg': 'shadow-lift', 'shadow-xl': 'shadow-lift',
  'shadow-2xl': 'shadow-lift', 'hover:shadow-md': 'hover:shadow-card',
  'hover:shadow-lg': 'hover:shadow-lift', 'hover:shadow-xl': 'hover:shadow-lift',
};

/* text-white 的几种归宿 —— 看这个元素自己的底色 */
function resolveWhite(tokens) {
  const has = (re) => tokens.some((t) => re.test(t));
  const self = ' ' + tokens.join(' ') + ' ';
  const solidAccent = has(/^(?:[a-z-]+:)*bg-(?:accent|success|danger|warning)(?:-press)?$/);
  const softAccent = has(/^(?:[a-z-]+:)*bg-(?:accent|success|danger|warning)-soft$/);
  const darkInk = has(/^(?:[a-z-]+:)*bg-ink$/);
  const lightSurface = has(/^(?:[a-z-]+:)*bg-(?:surface|surface-2|paper)(?:-[0-9a-z]+)?$/);
  const scrim = has(SCRIM_BG);
  return tokens.map((t) => {
    if (!/(^|:)text-white$/.test(t)) return t;
    if (t.startsWith('hover:') || t.startsWith('group-hover:')) {
      return lightSurface || softAccent || scrim ? t.replace('text-white', 'text-ink') : t.replace('text-white', 'text-accent');
    }
    if (scrim) return t;                 // 图片遮罩上的白字：合法
    if (solidAccent) return t.replace('text-white', 'text-accent-fg');
    if (darkInk) return t.replace('text-white', 'text-paper');
    if (softAccent || lightSurface) return t.replace('text-white', 'text-ink');
    // 没有底色：带字号/字重的是标题（旧深色页遗留）→ 墨字；
    // 只剩尺寸的是图标笔画 / 勾选标记 → 跟强调底走 --accent-fg
    if (/ (text-(xs|sm|base|lg|xl|[2-6]xl)|font-[a-z]+)/.test(self)) return t.replace('text-white', 'text-ink');
    if (/ [wh]-\d/.test(self)) return t.replace('text-white', 'text-accent-fg');
    return t;
  });
}

function dedupe(tokens) {
  const seen = new Set();
  let out = tokens.filter((t) => (seen.has(t) ? false : seen.add(t)));
  /* hover:bg-x 与底色撞成同一个值 → hover 无效，换成 opacity 的平坦反馈 */
  out = out.flatMap((t) => {
    const m = t.match(/^hover:bg-(.+)$/);
    if (m && seen.has('bg-' + m[1])) return ['hover:opacity-90'];
    return [t];
  });
  return out.filter((t, i, a) => a.indexOf(t) === i);
}

function phase2(rel, tokens) {
  if (KEEP_COLORS_FILES.includes(rel)) return { tokens, used: false };
  let changed = false;
  const stops = tokens.filter(isStop).length;
  const dirs = tokens.filter(isGradientDir).length;

  if (!KEEP_GRADIENT_FILES.includes(rel) && dirs >= 1 && stops >= 1) {
    const at = tokens.findIndex(isGradientDir); // 替代底色放回原位，diff 才读得顺
    const clip = tokens.some(isClipText);
    const dropGradientText = clip && tokens.some((t) => /^(?:[a-z-]+:)*text-transparent$/.test(t));
    /* 这些判断要在「删掉 from-/to-」之前读原始串，删完就没了 */
    const hadWhite = tokens.some((t) => t === 'text-white' || t.endsWith(':text-white'));
    const saturated = tokens.some((t) => /^(?:[a-z-]+:)*(?:from|via)-[a-z]+-[4-9]00/.test(t));
    const self = ' ' + tokens.join(' ') + ' ';
    tokens = tokens.filter((t) => !(isGradientDir(t) || isStop(t) || (clip && isClipText(t))));
    /* 渐变拆平后补什么底 —— 顺序即优先级：
       1. 上面压着白字 → 强调实底（白字随后由 resolveWhite 换成 --accent-fg）
       2. 封面/缩略图占位（aspect-*）→ 中性面板底
       3. 进度条那种铺满的条 → 强调实底
       4. 淡彩底（-*-50/100）→ 中性面板底
       5. 剩下的饱和色块 = 图标小块 → 强调淡底，上面的字保持墨色 */
    const hasBg = tokens.some((t) => /^bg-[a-z]/.test(t) && t !== 'bg-clip-text');
    let fill = null;
    if (dropGradientText) fill = 'text-accent';
    else if (!hasBg) {
      if (hadWhite) fill = 'bg-accent';
      else if (/ w-[123]( |$)/.test(self)) fill = 'bg-accent'; // 标题条那种 4px 竖杠：淡底等于看不见
      else if (/ aspect-/.test(self)) fill = 'bg-surface-2';
      else if (/ (?:h|w)-full( |$)/.test(self)) fill = 'bg-accent';
      else if (!saturated) fill = 'bg-surface-2';
      else fill = 'bg-accent-soft';
    }
    if (fill) tokens.splice(Math.min(at, tokens.length), 0, fill);
    changed = true;
  }

  const mapped = tokens.map((t) => SHADOW_MAP[t] ?? mapColorToken(t)).filter(Boolean);
  if (mapped.some((t, i) => t !== tokens[i])) changed = true;
  const white = resolveWhite(mapped);
  if (white.some((t, i) => t !== mapped[i])) changed = true;
  let final = dedupe(white);
  /* 拆平成强调实底的按钮：hover 反馈改成「底色加深一档」，不用浮起阴影；
     transition-all 会连带宽高/阴影一起动，收窄成 transition-colors。
     和 lib/file-utils.js 的 BTN_PRIMARY 保持同一条串，内联的 42 处和常量的 18 处才是同一个按钮。 */
  if (final.includes('bg-accent') && final.includes('text-accent-fg')) {
    final = final
      .map((t) => (t === 'hover:shadow-lift' ? 'hover:bg-accent-press' : t === 'hover:shadow-card' ? 'hover:bg-accent-press' : t === 'transition-all' ? 'transition-colors' : t))
      .filter((t, i, a) => a.indexOf(t) === i);
  }
  if (final.join(' ') !== tokens.join(' ')) changed = true;
  return { tokens: final, used: changed };
}

/* 明确不许自动动的东西 —— 只统计、只报告 */
const MANUAL_PATTERNS = [
  ['gradient', /gradient/],
  ['gradient-text', /text-transparent|bg-clip-text/],
  ['text-white', /(^|\s)text-white(?=\s|$)/],
  ['inline-linear-gradient', /linear-gradient\s*\(/],
  ['saturated-color-token', /\b(?:purple|indigo|violet|fuchsia|pink|rose|teal|cyan|orange|amber|yellow|emerald|lime|sky)-\d{2,3}\b/],
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.includes(e.name)) continue;
      walk(path.join(dir, e.name), out);
    } else if (/\.jsx?$/.test(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));
const report = [];
let changedFiles = 0;

/* className="..." | className={'...'} | className={`...`} | '...' 里的三元串都覆盖：
   统一用「引号内整段」作为处理单元，再判断它是不是 class 串。 */
const QUOTED = /(["'`])([^"'`\n]*?)\1/g;

function isClassString(s) {
  if (!s || !/[\s-]/.test(s)) return false;
  // class 串里绝不会出现中日韩文字；带文案的一律放过（防止把说明文字里的 "text - xx" 误当 class）
  if (/[㐀-鿿぀-ヿ가-힯]/.test(s)) return false;
  // 模板插值里的串也不动，避免折叠 ${} 周围的可读性空格
  if (s.includes('${') || s.includes('{') || s.includes('}')) return false;
  // 至少含一个已知的 class 前缀，避免误伤普通文案/路径
  // container 是整词（后面没有连字符），单独放行 —— 否则「container mx-auto px-4 py-12」
  // 这种 21 个页面都在用的页容器会被当成普通文案跳过，整站内页继续用 Tailwind 的流式 container，
  // 和首页的 .wrap（1140 + 安全边距）对不齐。
  return /(^|\s)(bg|text|border|ring|divide|placeholder|hover:|focus:|min-h|max-w|container|w-|h-|p-|m-|rounded|flex|grid|shadow|from|to|via)-/.test(s)
    || /(^|\s)container(\s|$)/.test(s);
}

for (const abs of files) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  let src = fs.readFileSync(abs, 'utf8');
  const hits = { whole: 0, token: 0, droppedDark: 0, phase2: 0 };
  const manual = {};

  let out = src.replace(QUOTED, (m, q, inner) => {
    if (!isClassString(inner)) return m;
    let s = inner;
    for (const [from, to] of WHOLE) {
      if (s === from) { s = to; hits.whole++; break; }
    }
    let tokens = s.split(/\s+/).filter(Boolean);
    tokens = tokens
      .filter((t) => {
        if (t.startsWith('dark:')) { hits.droppedDark++; return false; }
        return true;
      })
      .map((t) => {
        if (TOKEN[t]) { hits.token++; return TOKEN[t]; }
        return t;
      });
    const p2 = phase2(rel, tokens);
    if (p2.used) hits.phase2++;
    return q + p2.tokens.join(' ') + q;
  });

  for (const [name, re] of MANUAL_PATTERNS) {
    const n = (out.match(new RegExp(re.source, 'g')) || []).length;
    if (n) manual[name] = n;
  }
  /* 剩下的白字 / 渐变必须逐条看一眼 —— 报告出行号，不猜 */
  const lines = out.split('\n');
  const leftovers = [];
  lines.forEach((l, i) => {
    if (/(^|[\s'`"])text-white([\s'`"]|$)/.test(l) && !/bg-black\/|bg-gradient|from-/.test(l)) leftovers.push(`  ${rel}:${i + 1}  ${l.trim().slice(0, 120)}`);
  });

  const dirty = hits.whole + hits.token + hits.droppedDark + hits.phase2;
  if (dirty || Object.keys(manual).length) report.push({ rel, dirty, ...hits, manual, leftovers });
  if (dirty && WRITE) {
    if (out !== src) { fs.writeFileSync(abs, out, 'utf8'); changedFiles++; }
  }
}

report.sort((a, b) => b.dirty - a.dirty || (b.manual.gradient || 0) - (a.manual.gradient || 0));
const pad = (n, w) => String(n).padStart(w);
console.log(`${WRITE ? '已写入' : 'DRY-RUN'} · 扫描 ${files.length} 个文件 · 命中 ${report.length} 个`);
console.log('file'.padEnd(46), 'auto', 'whole', 'token', 'dark-', '渐变', '渐变字', 'text-white', '内联渐变', '彩色token');
for (const r of report) {
  console.log(
    r.rel.padEnd(46),
    pad(r.dirty, 4), pad(r.whole, 5), pad(r.token, 5), pad(r.droppedDark, 5),
    pad(r.manual.gradient || 0, 4), pad(r.manual['gradient-text'] || 0, 5),
    pad(r.manual['text-white'] || 0, 8), pad(r.manual['inline-linear-gradient'] || 0, 8),
    pad(r.manual['saturated-color-token'] || 0, 10)
  );
}
const sum = (k) => report.reduce((a, r) => a + (r[k] || 0), 0);
const msum = (k) => report.reduce((a, r) => a + (r.manual[k] || 0), 0);
console.log('\n自动替换合计:', report.reduce((a, r) => a + r.dirty, 0),
  '| 其中剥离 dark: 变体', sum('droppedDark'), '| 第二遍改动串', sum('phase2'),
  '| 仍需人工 → 渐变', msum('gradient'), '渐变字', msum('gradient-text'),
  'text-white', msum('text-white'), '内联渐变', msum('inline-linear-gradient'),
  '彩色 token', msum('saturated-color-token'));

const leftovers = report.flatMap((r) => r.leftovers || []);
if (leftovers.length) {
  console.log(`\n待确认的裸 text-white（${leftovers.length} 处，脚本不敢猜底色）:`);
  console.log(leftovers.join('\n'));
}
if (!WRITE) console.log('\n（dry-run，未落盘。加 --write 执行）');
