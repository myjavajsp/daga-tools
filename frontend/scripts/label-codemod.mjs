#!/usr/bin/env node
/**
 * label-codemod.mjs —— 把内页手抄的表单标签统一成 .lbl（见 index.css）。
 *
 * 「block text-sm font-medium text-ink-2 mb-2」这一串在 50+ 个文件里各抄一遍，
 * 并且已经漂出 font-medium/font-semibold、mb-2/mb-1.5/mb-3、text-sm/text-xs 几个变体。
 * .lbl 把这颗标签收在一处：13px / 600 / --ink-2 / 下边距 6px。
 *
 * 只认「块级 + 中灰 + 半粗」三件套齐全的，其余（正文里的小标题、statcard 的说明行）不动。
 * 动态 className={`…`} 一律不碰，需要人工确认。
 *
 * 用法：node scripts/label-codemod.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');

const DROP = new Set(['block', 'text-sm', 'font-medium', 'font-semibold', 'text-ink-2', 'mb-2']);

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
  const next = src.replace(/className="([^"]*)"/g, (m, raw, offset) => {
    const before = src.slice(Math.max(0, offset - 220), offset);
    /* 只改 <label> / <span> / <p> / <div> 上紧贴控件的那颗标签 */
    if (!/<(label|span|p|div)\b[^<]*$/.test(before)) return m;
    const cls = raw.split(/\s+/).filter(Boolean);
    const has = (c) => cls.includes(c);
    if (!has('block') || !has('text-sm') || !has('text-ink-2')) return m;
    if (!has('font-medium') && !has('font-semibold')) return m;
    const rest = cls.filter((c) => !DROP.has(c));
    const value = `lbl ${rest.join(' ')}`.trim();
    if (value === raw) return m;
    n += 1;
    tally.lbl = (tally.lbl || 0) + 1;
    if (samples.length < 10) samples.push(`${raw}\n   -> ${value}`);
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
