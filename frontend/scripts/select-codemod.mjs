#!/usr/bin/env node
/**
 * select-codemod.mjs —— 把内页里手抄的 <select> 样式统一成 .input。
 *
 * 为什么要单独跑：select.input 在 index.css 里带原生下拉箭头（appearance:none + 内联 svg chevron），
 * 而散落在各 tools/* 的 select 各自抄了一份 bg-paper + rounded-xl + focus:ring-accent-soft，
 * 材质和内页表单件不一致，深色档下 focus 环基本看不见。
 *
 * 规则：只改 <select> 标签自己的 className，保留纯布局类（w-* / flex / min-w / max-w / 断点前缀 / mono），
 * 其余视觉类一律丢掉换成 `input`。option、标签体不动。
 *
 * 不用正则切标签：<select value={x} onChange={e => setX(e.target.value)} className="…">
 * 里 `=>` 自带一个 `>`，`[\s\S]*?>` 会在那里提前收尾（要么漏改，要么截断），
 * 所以手写一个「括号深度 + 引号状态」扫描器找真正的标签末尾。
 *
 * 用法：node scripts/select-codemod.mjs          # 干跑，只打印将要改什么
 *      node scripts/select-codemod.mjs --write  # 落盘
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const SRC = join(ROOT, 'src');

// 布局/排版类：和「材质」无关，换成 .input 之后仍然要留
const KEEP = /^(w-(full|auto|xs|sm|md|lg|xl|\d+)|flex(-1|-none)?|min-w-0|max-w-[\w-]+|sm:[\w-]+|md:[\w-]+|mono|text-center)$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'admin') continue; // 后台暂不动
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.jsx')) out.push(p);
  }
  return out;
}

/** 从 <select 的 s 开始，返回标签结束的 `>` 下标（含）；找不到返回 -1 */
function tagEnd(src, start) {
  let depth = 0; // {} 嵌套
  let quote = null; // ' 或 "
  for (let i = start + '<select'.length; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === '\\') i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '{') { depth += 1; continue; }
    if (c === '}') { depth -= 1; continue; }
    if (c === '>' && depth === 0) return i;
  }
  return -1;
}

const ATTR = /className=(["'])([^"']*)\1/;

let scanned = 0;
let changed = 0;

for (const file of walk(SRC)) {
  const src = readFileSync(file, 'utf8');
  if (!/<select\b/.test(src)) continue;
  scanned += 1;

  // 从后往前替换，避免下标错位
  const hits = [];
  let at = 0;
  for (;;) {
    const i = src.indexOf('<select', at);
    if (i === -1) break;
    const end = tagEnd(src, i);
    if (end === -1) break;
    hits.push([i, end]);
    at = end + 1;
  }

  let out = src;
  for (const [i, end] of hits.reverse()) {
    const tag = out.slice(i, end + 1);
    const m = tag.match(ATTR);
    if (!m) continue;
    const kept = m[2].split(/\s+/).filter((c) => KEEP.test(c));
    const value = `input ${kept.join(' ')}`.trim();
    if (m[2] === value) continue;
    changed += 1;
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    console.log(`  select  ${rel}\n          ${m[2]}\n       -> ${value}`);
    const replaced = tag.replace(ATTR, `className="${value}"`);
    out = out.slice(0, i) + replaced + out.slice(end + 1);
  }

  if (WRITE && out !== src) writeFileSync(file, out, 'utf8');
}

console.log(`\n${WRITE ? '已写入' : '干跑'}：${scanned} 个文件含 <select>，替换 ${changed} 处。`);
if (!WRITE) console.log('确认无误后加 --write 落盘。');
