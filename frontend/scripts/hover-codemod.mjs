/**
 * hover-codemod.mjs — hover:opacity-90 → hover:bg-surface-3
 *
 * 为什么要换：工具页的次级按钮（bg-surface-2 那一档）以前一律用
 * `hover:opacity-90` 表达悬停。把整块压暗 10% 在 #eef0f2 上肉眼几乎看不出来 ——
 * 悬停等于没反应，而且它顺手把文字也压淡了，13px 的 --ink-2 从 6.98:1 掉到
 * 6.1:1 左右。这和 .act 当初「hover 前后同一个颜色」是同一个毛病。
 *
 * 换成设计系统里新增的一档底色 --surface-3（比 --surface-2 深一档的中性面），
 * 悬停只改底、不动字：实测 --ink-2 压 --surface-3 = 5.41:1（浅色档）/
 * 7.17:1（深色档），仍然稳过正文 4.5:1。
 *
 * 只动 hover: 变体，静态渲染的类名一个都不改，所以这轮不需要重跑全站测量。
 *
 * 用法：node scripts/hover-codemod.mjs          # 干跑，只报数 + 打样本
 *       node scripts/hover-codemod.mjs --write  # 落盘
 * src/pages/admin/** 不在改造范围内，跳过。
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const WRITE = process.argv.includes('--write');
const SKIP_DIR = /(^|[/\\])admin([/\\]|$)/;
const FROM = 'hover:opacity-90';
const TO = 'hover:bg-surface-3';

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
const samples = [];

for (const p of walk(SRC)) {
  const src = readFileSync(p, 'utf8');
  const n = src.split(FROM).length - 1;
  if (!n) continue;
  files++;
  sites += n;
  rows.push(`${String(n).padStart(3)}  ${relative(ROOT, p)}`);
  if (samples.length < 4) {
    const at = src.indexOf(FROM);
    samples.push(relative(ROOT, p) + '\n  前: ' + src.slice(Math.max(0, at - 60), at + 30).replace(/\s+/g, ' ') +
      '\n  后: ' + src.slice(Math.max(0, at - 60), at - 60 + 90).replace(FROM, TO).replace(/\s+/g, ' '));
  }
  if (WRITE) writeFileSync(p, src.replaceAll(FROM, TO), 'utf8');
}

rows.sort((a, b) => parseInt(b) - parseInt(a));
console.log(`${WRITE ? '已改写' : '待改写'} ${files} 个文件 / ${sites} 处 ${FROM}`);
console.log(rows.join('\n'));
console.log('\n样本：\n' + samples.join('\n'));
if (!WRITE && sites) console.log('\n加 --write 落盘。');
