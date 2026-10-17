#!/usr/bin/env node
/**
 * spinner-codemod.mjs —— 全站 loading 圈统一成 .spin（见 index.css）。
 *
 * 背景：同一个「转圈」在 10 个文件里有 6 种抄法：
 *   border-t-orange-500 / border-t-blue-500 / border-t-pink-500 —— 都不在色板里，
 *   深色档下蓝 500、粉 500 的亮度直接和页面材质脱节；
 *   h-8 / h-10 / h-12 三档尺寸，border-2 / border-4 两种粗细。
 * 现在只有 .spin（40px）与 .spin.sm（18px，按钮内）两档，颜色只跟 --accent。
 *
 * 用法：node scripts/spinner-codemod.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');

const RULES = [
  // animate-spin rounded-full h-12 w-12 border-4 border-line border-t-blue-500
  [/animate-spin rounded-full h-\d+(?:\.\d+)? w-\d+(?:\.\d+)? border-[24] border-line border-t-[\w-]+/g, 'animate-spin spin'],
  // animate-spin h-10 w-10 rounded-full border-2 border-line border-t-accent
  [/animate-spin h-\d+(?:\.\d+)? w-\d+(?:\.\d+)? rounded-full border-[24] border-line border-t-[\w-]+/g, 'animate-spin spin'],
];

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

for (const file of walk(join(ROOT, 'src'))) {
  let src = readFileSync(file, 'utf8');
  const before = src;
  for (const [re, to] of RULES) {
    src = src.replace(re, (m) => {
      if (m === to) return m;
      tally[to] = (tally[to] || 0) + 1;
      return to;
    });
  }
  if (src !== before) {
    touched.push(relative(ROOT, file).replace(/\\/g, '/'));
    if (WRITE) writeFileSync(file, src, 'utf8');
  }
}

console.log(JSON.stringify({ mode: WRITE ? 'write' : 'dry-run', touched, tally }, null, 1));
