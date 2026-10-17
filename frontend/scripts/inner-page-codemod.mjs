// 内页结构改造：把 7 个内容页残留的「手写标题条」换成设计系统的 .phead，
// 把卡片容器换成 .card，把橙色 spinner 换成主题色，把空状态 emoji 换成 <Icon>。
// 默认干跑，--write 才落盘。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const DIR = 'E:/MTC/daga-clone/frontend/src/pages';
const WRITE = process.argv.includes('--write');

const tally = {};
const notes = [];

const bump = (k) => { tally[k] = (tally[k] || 0) + 1; };

// ---- 规则 A：手写标题条 -> .phead ----
// <div className="mb-6">
//   <div className="flex items-center gap-2 mb-2">
//     <div className="w-1 h-6 rounded-full bg-accent"></div>
//     <h1 className="...">TITLE</h1>
//   </div>
//   <p className="text-ink-3 text-sm ml-3">SUB</p>      <- 可能跨行，也可能没有
// </div>
const HEAD = /<div className="mb-6">\s*<div className="flex items-center gap-2 mb-2">\s*<div className="w-1 h-6 rounded-full bg-accent"><\/div>\s*<h1 className="[^"]*">([\s\S]*?)<\/h1>\s*<\/div>(?:\s*<p className="text-ink-3 text-sm ml-3">([\s\S]*?)<\/p>)?\s*<\/div>/g;

// ---- 规则 B：卡片容器（保留原有的外边距，不然区块会粘在一起）----
const CARD = /className="bg-surface rounded-xl border border-line (p-[^\s"]+(?: md:p-[^\s"]+)?)( mb-6)?"/g;

// ---- 规则 C：橙色 spinner（不在色板里）----
const SPIN = /animate-spin rounded-full h-12 w-12 border-4 border-line border-t-orange-500/g;
const SPIN_B = /animate-spin rounded-full h-12 w-12 border-b-2 border-accent/g;

function fix(file) {
  const path = `${DIR}/${file}`;
  let src = readFileSync(path, 'utf8');
  const before = src;

  src = src.replace(HEAD, (m, title, sub) => {
    bump('phead');
    const t = title.replace(/\s+/g, ' ').trim();
    if (!sub) return `<div className="phead">\n          <h1>${t}</h1>\n        </div>`;
    const s = sub.replace(/\s+/g, ' ').trim();
    return `<div className="phead">\n          <h1>${t}</h1>\n          <span className="note">${s}</span>\n        </div>`;
  });

  src = src.replace(CARD, (m, pad, gap) => { bump('card'); return `className="card ${pad}${gap || ''}"`; });
  src = src.replace(SPIN, () => { bump('spinner'); return 'animate-spin h-10 w-10 rounded-full border-2 border-line border-t-accent'; });
  src = src.replace(SPIN_B, () => { bump('spinner'); return 'animate-spin h-10 w-10 rounded-full border-2 border-line border-t-accent'; });

  if (src !== before) {
    notes.push(file);
    if (WRITE) writeFileSync(path, src);
  }
  return src !== before;
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.jsx'));
for (const f of files) fix(f);

console.log(JSON.stringify({ mode: WRITE ? 'write' : 'dry-run', touched: notes.length, files: notes, tally }, null, 1));
