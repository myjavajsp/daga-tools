/**
 * radius-codemod.mjs — rounded-xl → rounded-card
 *
 * 为什么要换：tailwind.config.js 里 card:'12px'，而 rounded-xl 是 Tailwind
 * 默认的 0.75rem=12px —— 两者渲染结果完全一致，所以这次替换是**零几何变化**的，
 * 唯一收益是让圆角走 token：以后想调卡片圆角只改 config 一处，
 * 不用在 300 多个类名里赌哪个是 12px 哪个不是。
 *
 * 不动 rounded-lg(8px) / rounded-sm(9px) / rounded-full —— 它们各有自己的尺寸语义，
 * 强行合并会真的改变布局。
 *
 * 用法：node scripts/radius-codemod.mjs          # 干跑，只报数
 *       node scripts/radius-codemod.mjs --write  # 落盘
 * src/pages/admin/** 这次不在改造范围内，跳过。
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const WRITE = process.argv.includes('--write');
const SKIP_DIR = /(^|[/\\])admin([/\\]|$)/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (SKIP_DIR.test(p)) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(name)) out.push(p);
  }
  return out;
}

let files = 0;
let sites = 0;
const rows = [];

for (const p of walk(SRC)) {
  const src = readFileSync(p, 'utf8');
  const n = (src.match(/rounded-xl/g) || []).length;
  if (!n) continue;
  files++;
  sites += n;
  rows.push(`${String(n).padStart(3)}  ${relative(ROOT, p)}`);
  if (WRITE) writeFileSync(p, src.replaceAll('rounded-xl', 'rounded-card'), 'utf8');
}

rows.sort((a, b) => parseInt(b) - parseInt(a));
console.log(`${WRITE ? '已改写' : '待改写'} ${files} 个文件 / ${sites} 处 rounded-xl`);
console.log(rows.slice(0, 15).join('\n'));
if (!WRITE && sites) console.log('\n加 --write 落盘。');
