#!/usr/bin/env node
/**
 * btn-codemod.mjs —— 把内页手抄的实底按钮统一成 .btn-a（见 index.css）。
 *
 * 旧写法在 tools/* 里抄了 60+ 份，同一颗「主按钮」有 px-4/px-6/px-8、py-2/py-2.5/py-3、
 * rounded-lg/rounded-xl、font-medium/font-semibold 四五漂移，
 * 高度从 34 到 52 不等，同屏并排时基线对不齐。
 * .btn-a 把材质（强调底 + 前景 + 9px 圆角 + min-height 40）收在一处，
 * 组件里只留布局（w-full / flex-1 / px-* / disabled:* / 断点）。
 *
 * 规则：className 同时含 (bg-accent|bg-success|bg-danger|bg-warning) + text-accent-fg + rounded-*
 *   → 丢掉材质类，加 .btn-a 与语义变体（ok / danger / warn），保留其余类；py-* 一并删掉，
 *     高度由 min-height:40px 统一决定。
 * 动态拼接（className={`...`} 或 {'...'}）不动 —— 那类需要人工确认分支。
 *
 * 用法：node scripts/btn-codemod.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');

const VARIANT = { 'bg-accent': '', 'bg-success': 'ok', 'bg-danger': 'danger', 'bg-warning': 'warn' };
// 这些是 .btn-a 已经负责材质，组件里不用再写
const DROP = /^(bg-(accent|success|danger|warning)$|text-accent-fg$|rounded-(xl|lg|md|card|sm)$|font-(semibold|medium|bold)$|hover:bg-(accent|success|danger|warning)(-press)?$|transition(-(color|all))?(-\d+)?$|duration-\d+$|py-[\d.]+|p-y-\d+|disabled:opacity-\d+)$/;
// 必须出现的材质特征，缺一个就说明这不是那颗按钮
const NEED = /^(bg-(accent|success|danger|warning))$/;
const HAS_FG = /^text-accent-fg$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'admin') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.jsx')) out.push(p);
  }
  return out;
}

const tally = {};
const touched = [];
const samples = [];

for (const file of walk(join(ROOT, 'src'))) {
  const src = readFileSync(file, 'utf8');
  let n = 0;
  // 只吃静态字符串 className="…"
  const next = src.replace(/className="([^"]*)"/g, (m, raw, offset) => {
    /* 必须是 <button>/<a>/<Link> 的 className：
       光看类名分不清「主按钮」和「bg-accent 的小徽标」，
       徽标套上 .btn-a 会被 min-height:40px 撑成一条横幅。 */
    const before = src.slice(Math.max(0, offset - 500), offset);
    if (!/<(button|a|Link)\b[^<]*$/.test(before)) return m;
    const cls = raw.split(/\s+/).filter(Boolean);
    const fill = cls.find((c) => NEED.test(c));
    if (!fill) return m;
    if (!cls.some((c) => HAS_FG.test(c))) return m;
    if (!cls.some((c) => /^rounded-/.test(c))) return m;
    const rest = cls.filter((c) => !DROP.test(c));
    const variant = VARIANT[fill];
    const value = ['btn-a', variant, ...rest].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    if (value === raw) return m;
    n += 1;
    if (samples.length < 14) samples.push(`${raw}\n   -> ${value}`);
    tally[variant ? `btn-a ${variant}` : 'btn-a'] = (tally[variant ? `btn-a ${variant}` : 'btn-a'] || 0) + 1;
    return `className="${value}"`;
  });
  if (n) {
    touched.push(`${relative(ROOT, file).replace(/\\/g, '/')} (${n})`);
    if (WRITE) writeFileSync(file, next, 'utf8');
  }
}

console.log(JSON.stringify({ mode: WRITE ? 'write' : 'dry-run', files: touched.length, tally }, null, 1));
console.log(touched.join('\n'));
if (samples.length) console.log('\n--- 样例 ---\n' + samples.join('\n'));
