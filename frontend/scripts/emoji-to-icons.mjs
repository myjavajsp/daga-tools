#!/usr/bin/env node
/**
 * emoji-to-icons.mjs —— 把「当图标用的 emoji」换成 Icons.jsx 里的线性图标
 *
 * 背景：站点的硬规则是「emoji 只能出现在内容里，不能出现在 UI 骨架里」。
 * 所以这个脚本严格分两侧：
 *   会改：空状态大字符、虚线上传区首行、色块芯片、💡 小节标题、icon="…" 属性
 *   不碰：文案生成器输出的 emoji、表情包数据、生肖星座符号…（见 DATA_FILES）
 *
 * 用法：
 *   node scripts/emoji-to-icons.mjs          # dry-run，只统计
 *   node scripts/emoji-to-icons.mjs --write  # 落盘
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');

/* 「数据」侧：这些文件里的 emoji 是内容本身，一律不动 */
const DATA_FILES = new Set([
  'src/components/tools/GreetingGenerator.jsx',
  'src/components/tools/MomentsCopy.jsx',
  'src/components/tools/DouyinScript.jsx',
  'src/components/tools/XiaohongshuCopy.jsx',
  'src/components/tools/ShortDramaScript.jsx',
  'src/components/tools/AgeCalculator.jsx', // ♒🐭 就是星座生肖本身
  'src/pages/MemePage.jsx',                 // 表情包数据
  'src/pages/MakerPage.jsx',                // 表情制造机，emoji 是素材
]);

/* emoji → 图标名（Maps 里不带变体选择符，匹配前先剥掉 \uFE0F） */
const MAP = {
  '🎨': 'palette', '📊': 'chart', '📁': 'file', '🖼': 'image', '✂': 'scissors',
  '📐': 'grid9', '📷': 'camera', '✨': 'sparkles', '🔍': 'search', '💧': 'droplet',
  '📖': 'file', '📉': 'chart', '🔒': 'lock', '🔓': 'unlock', '📄': 'doc',
  '📦': 'box', '🎬': 'filmstrip', '🎞': 'filmstrip', '💡': 'bulb', '🎭': 'maskface',
  '🪪': 'idcard', '🌍': 'globe', '📱': 'phone', '🔥': 'flame', '👥': 'users',
  '📺': 'tv', '👁': 'eye', '📅': 'calendar', '💬': 'chat', '📧': 'mail',
  '👤': 'user', '✍': 'pen', '✅': 'check', '🧠': 'scan', '🔢': 'sliders',
  '💼': 'idcard', '🔄': 'swap', '📏': 'ruler', '⚖': 'scale', '🌡': 'thermometer',
  '🧪': 'flask', '🎧': 'music', '☁': 'box', '🔧': 'sliders', '🎤': 'music',
};

const E = String.raw`\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}`;
const glyphRe = new RegExp(`[${E}${String.raw`\uFE0F`}]+`, 'gu');
const hasEmoji = (s) => new RegExp(`[${E}]`, 'u').test(s);
const stripVs = (s) => s.replace(/️/g, '').trim();

function iconName(raw) {
  const s = stripVs(raw);
  if (!s) return null;
  return MAP[s] || MAP[[...s].join('')] || null;
}

/* 每条规则：[名字, 正则（第一个捕获组是 emoji 所在文本）, 替换] */
const RULES = [
  [
    'hero',
    new RegExp(`<div className="text-(?:[2-6]xl)[^"]*">([^<]*)</div>`, 'gu'),
    (whole, text) => {
      const name = iconName(text);
      return name
        ? `<div className="flex justify-center mb-3"><span className="chip"><Icon name="${name}" /></span></div>`
        : null;
    },
  ],
  [
    'span-hero',
    new RegExp(`<span className="text-[2-5]xl">([^<]*)</span>`, 'gu'),
    (whole, text) => {
      const name = iconName(text);
      return name ? `<Icon name="${name}" />` : null;
    },
  ],
  [
    'chip-tile',
    new RegExp(
      `<div className="w-(?:10|12) h-(?:10|12) rounded-(?:lg|full) bg-[a-z]+-soft flex items-center justify-center text-[23]xl">([^<]*)</div>`,
      'gu',
    ),
    (whole, text) => {
      const name = iconName(text);
      return name ? `<span className="chip"><Icon name="${name}" /></span>` : null;
    },
  ],
  [
    'note-head',
    new RegExp(`<div className="font-medium text-ink mb-2">([${E}${String.raw`\uFE0F`}]+)\\s*([^<]*)</div>`, 'gu'),
    (whole, glyph, text) =>
      `<div className="flex items-center gap-2 font-medium text-ink mb-2 text-sm"><Icon name="${iconName(glyph) || 'bulb'}" /><span>${text}</span></div>`,
  ],
  [
    'icon-prop',
    new RegExp(`icon="([^"]*)"`, 'gu'),
    (whole, text) => {
      const name = iconName(text);
      return name ? `icon="${name}"` : null;
    },
  ],
];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.jsx?$/.test(entry)) files.push(p);
  }
})(SRC);

const WRITE = process.argv.includes('--write');
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
const counts = Object.fromEntries(RULES.map(([n]) => [n, 0]));
const leftover = [];
let changed = 0;

for (const file of files) {
  const r = rel(file);
  if (r.startsWith('src/pages/admin/') || DATA_FILES.has(r)) continue;
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  for (const [name, re, build] of RULES) {
    src = src.replace(re, (...a) => {
      const groups = a.slice(1, -2);
      const text = groups[0];
      if (!hasEmoji(text)) return a[0]; // 没有 emoji 的行不属于本次范围（避免动到中文标题）
      const out = build(a[0], ...groups);
      if (out === null) {
        leftover.push(`${r}: ${name} → ${stripVs(text)}`);
        return a[0];
      }
      counts[name]++;
      return out;
    });
  }

  if (src !== before) {
    changed++;
    if (WRITE && /<Icon /.test(src) && !/import Icon from/.test(src)) {
      const target = r.startsWith('src/components/tools/')
        ? '../Icons'
        : r.startsWith('src/components/')
          ? './Icons'
          : '../components/Icons';
      // 注意：项目里不少 .jsx 以 BOM 开头，所以 ^ 后面要先允许 \uFEFF
      src = src.replace(/^(\uFEFF?import[^\n]*\n)/m, `$1import Icon from '${target}';\n`);
    }
    if (WRITE) fs.writeFileSync(file, src);
  }
}

console.log(`${WRITE ? '已写入' : 'DRY-RUN'}：${changed} 个文件`);
Object.entries(counts).forEach(([n, c]) => console.log(`  ${n}: ${c}`));
if (leftover.length) {
  console.log('  未识别的 emoji（保持原样）:');
  leftover.forEach((l) => console.log('    ' + l));
}
