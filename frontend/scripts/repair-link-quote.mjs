/**
 * repair-link-quote.mjs — 修 link-codemod 吃掉的那个闭合引号（一次性）
 *
 * link-codemod.mjs 里回写时用了 slice(r.end + 1)，而 r.end 本身就是闭合引号的下标，
 * 于是 15 处替换全少了一个 " —— 表现是 className="act>复制</button> 这种没闭合的属性。
 * 下标已经在校验里修好，这个脚本只负责把已经落到磁盘上的损坏补回来。
 *
 * 三条规则按损坏形态分：
 *   R1 值以 > 结束（13 处）：className="act…>   → className="act…">
 *   R2 值到行尾结束、> 在下一行（BoxShadowGenerator / UuidGenerator 2 处）：行尾补引号
 *   R3 值后面紧跟另一个带引号的属性（AIToolsPage 1 处）：className="act href=" → "act" href="
 *
 * 用法：node scripts/repair-link-quote.mjs [--write]
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const WRITE = process.argv.includes('--write');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (/(^|[/\\])admin([/\\]|$)/.test(p)) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.jsx$/.test(name)) out.push(p);
  }
  return out;
}

let fixed = 0;

for (const p of walk(SRC)) {
  const src = readFileSync(p, 'utf8');
  if (!src.includes('className="act')) continue;
  const lines = src.split('\n');
  let n = 0;

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (!L.includes('className="act') || L.includes('className="act"')) continue;

    /* R1：损坏点就在 > 前面 */
    const m1 = /(className="act[^"<>]*)>/.exec(L);
    if (m1) { lines[i] = L.replace(m1[1], m1[1] + '"'); n++; continue; }

    /* R2：本行没有 >，> 在下一行 —— 行尾补引号。
       必须先于 R3 判：否则 "act ml-2 shrink-0" 这种会被当成"后面还有别的属性"，
       引号插错位置，值被截断。 */
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length && lines[j].trim() === '>') { lines[i] = L + '"'; n++; continue; }

    /* R3：值后面紧跟另一个带引号的属性（AIToolsPage 那种单行多属性），引号插在 act 之后 */
    const m2 = /(className="act)(\s)/.exec(L);
    if (m2 && !L.includes('className="act"')) { lines[i] = L.replace(m2[1], m2[1] + '"'); n++; continue; }
  }

  if (n) {
    fixed += n;
    console.log(`  ${n}  ${relative(ROOT, p)}`);
    if (WRITE) writeFileSync(p, lines.join('\n'), 'utf8');
  }
}

console.log(`${WRITE ? '已补回' : '待补回'} ${fixed} 处闭合引号`);
