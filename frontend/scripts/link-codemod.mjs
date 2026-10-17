/**
 * link-codemod.mjs — 文字动作统一成 .act
 *
 * 收的是 label-codemod / btn-codemod 漏掉的那一类：既不是实底按钮也不是正文链接，
 * 而是「复制」「查看更多」「打开链接」这种裸文字动作。旧写法有两个毛病：
 *   1. text-accent hover:text-accent —— 悬停前后同一个颜色，等于没做反馈；
 *   2. 字号 text-xs(12px) 撑出来的点击框只有 16px 高，低于 24px 触控下限（实测）。
 * .act 在 src/index.css 里一次解决：min-height 24px + hover 压深一档。
 *
 * 只改真正的 <button> / <a> 的 className 字面量，且必须同时含 text-accent 和
 * hover:text-accent，避免误伤普通文字。剥掉由 .act 负责的 size/weight 类，
 * 保留布局类（ml-2 / shrink-0 / block / text-center / py-2 …）。
 *
 * 用法：node scripts/link-codemod.mjs          # 干跑
 *       node scripts/link-codemod.mjs --write  # 落盘
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const WRITE = process.argv.includes('--write');
const SKIP_DIR = /(^|[/\\])admin([/\\]|$)/;

/* .act 自己负责颜色/字号/字重，这三类留在串里只会和它打架 */
const DROP = /^(text-(xs|sm)|font-medium|font-semibold)$/;
/* 保留下来的都是布局类，按原顺序排在 .act 后面 */
const KEEP = /^(ml-\d+|mr-\d+|mt-\d+|mb-\d+|shrink-0|flex-none|flex-1|block|inline-block|text-center|w-full|px-\S+|py-\S+)$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (SKIP_DIR.test(p)) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.jsx$/.test(name)) out.push(p);
  }
  return out;
}

/* 从 className="…" 的起始引号往后扫到配对的结束引号（属性值里不会出现裸引号） */
function classRanges(src) {
  const hits = [];
  const re = /className=(?:"([^"]*)")/g;
  let m;
  while ((m = re.exec(src))) hits.push({ start: m.index + 11, end: re.lastIndex - 1, value: m[1] });
  return hits;
}

let files = 0;
let sites = 0;
const samples = [];

for (const p of walk(SRC)) {
  const src = readFileSync(p, 'utf8');
  if (!src.includes('text-accent hover:text-accent')) continue;
  const ranges = classRanges(src).filter((r) => {
    /* 必须按「整词」判定：/\btext-accent\b/ 会在 hover:text-accent 里也匹配成功
       （- 不是单词字符，冒号后面就有边界），那样会把
       「text-ink-2 hover:text-accent」这种本来就有效的悬停 chip 误判成死链接。 */
    const toks = r.value.split(/\s+/).filter(Boolean);
    return toks.includes('text-accent') && toks.includes('hover:text-accent');
  });
  if (!ranges.length) continue;

  let next = src;
  /* 从后往前替换，前面的下标才不会因为长度变化而失效 */
  for (const r of ranges.reverse()) {
    const parts = r.value.split(/\s+/).filter(Boolean);
    const kept = parts.filter((c) => !DROP.test(c) && c !== 'text-accent' && c !== 'hover:text-accent');
    const unknown = kept.filter((c) => !KEEP.test(c));
    if (unknown.length) {
      console.warn(`  ! 未知保留类 ${relative(ROOT, p)}: ${unknown.join(' ')} —— 已按原样保留`);
    }
    const value = ['act', ...kept].join(' ');
    /* r.end 指的就是那个闭合引号，所以这里必须 slice(r.end) 把它一起留下。
       早先写成 slice(r.end + 1)，15 处替换全少吃了一个引号（className="act> 这种），
       由 scripts/repair-link-quote.mjs 补的盘。 */
    next = next.slice(0, r.start) + value + next.slice(r.end);
    sites++;
    if (samples.length < 14) samples.push(`${relative(ROOT, p)}\n    - ${r.value}\n    + ${value}`);
  }
  files++;
  if (WRITE) writeFileSync(p, next, 'utf8');
}

console.log(`${WRITE ? '已改写' : '待改写'} ${files} 个文件 / ${sites} 处文字动作 → .act`);
console.log(samples.join('\n'));
if (!WRITE && sites) console.log('\n加 --write 落盘。');
