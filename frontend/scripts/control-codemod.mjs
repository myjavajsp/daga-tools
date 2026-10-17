/**
 * control-codemod.mjs — 手抄的滑杆/取色器配方收进设计系统类
 *
 * 旧写法是 13 个工具页各自抄同一串
 *   w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer
 * 问题是 appearance:none 会把浏览器原本画好的轨道和滑块一起抹掉，
 * 最后只剩一个 8px 高的背景条：没有滑块、拖动区低于 24px 触控下限。
 * 这里换成 .slider（见 src/index.css），轨道和滑块由设计系统自己画。
 *
 * 同一批还有 .swatch：input[type=color] 在 flex 行里会被同行文字挤扁
 * （实测 375px 视口下压到 6px 宽），6 处各写一套尺寸，现在统一成 40px 方块。
 *
 * 只替换**完整字面量**，且这两串在全站是唯一出现（已用 appearance-none / "w-20 h-1"
 * 反查确认没有别的元素在用），所以直接串替换即可，不必解析 JSX。
 *
 * 用法：node scripts/control-codemod.mjs          # 干跑
 *       node scripts/control-codemod.mjs --write  # 落盘
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const WRITE = process.argv.includes('--write');
const SKIP_DIR = /(^|[/\\])admin([/\\]|$)/;

/* 取色器：GradientGenerator 那条是手写修正版（h-10 w-10 flex-none + 描边），
   和 .swatch 是同一件事，一起收进设计系统类。 */
const SWATCH = 'h-10 w-10 flex-none cursor-pointer rounded-sm border border-line-2 bg-surface';
/* 尾部加 (?![\w-])：不带这个断言的话 "w-20 h-1" 会把 "w-20 h-12" 也吃掉
   （h-1 是 h-12 的前缀），纯串替换在这种短类名上是会出事的。 */
const RULES = [
  { from: 'w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer', to: 'slider' },
  { from: 'w-20 h-1', to: 'slider w-20' },
  { from: 'w-10 h-10 rounded cursor-pointer', to: 'swatch' },
  { from: SWATCH, to: 'swatch' },
].map((r) => ({ ...r, re: new RegExp(r.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'g') }));

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

let files = 0;
let sites = 0;
const tally = new Map(RULES.map((r) => [r.from, 0]));

for (const p of walk(SRC)) {
  const src = readFileSync(p, 'utf8');
  let next = src;
  for (const { from, to, re } of RULES) {
    const n = (next.match(re) || []).length;
    if (!n) continue;
    tally.set(from, tally.get(from) + n);
    next = next.replace(re, () => to);
    sites += n;
  }
  if (next !== src) {
    files++;
    console.log(`  ${relative(ROOT, p)}`);
    if (WRITE) writeFileSync(p, next, 'utf8');
  }
}

for (const [from, n] of tally) console.log(`  ${String(n).padStart(2)}  "${from}"`);
console.log(`${WRITE ? '已改写' : '待改写'} ${files} 个文件 / ${sites} 处小控件`);
if (!WRITE && sites) console.log('\n加 --write 落盘。');
