import fs from 'node:fs';
import path from 'node:path';

/**
 * container-codemod —— 把内页残留的 Tailwind 流体容器换成全站统一的 .wrap
 *
 * 两类问题：
 *  1) max-w-7xl/6xl + px-4 的容器宽度和首页 .wrap（1140 + 安全内边距）不一致，
 *     首页与内页的左边缘对不齐；
 *  2) max-w-3xl 之类单写不会居中（缺 mx-auto），内容贴左。
 * 统一成 <main class="wrap py-8 [col-sm|col-md]">，窄栏在 .wrap 内部自己居中。
 *
 * 用法：node scripts/container-codemod.mjs [--write]
 */
const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES = path.join(ROOT, 'src', 'pages');
const WRITE = process.argv.includes('--write');

/* 需要窄栏的页面：正文/播放器铺满 1140 会散开 */
const NARROW = {
  'M3u8PlayerPage.jsx': 'col-sm',
  'Mp4PlayerPage.jsx': 'col-sm',
  'MemberPage.jsx': 'col-sm',
  'VideoParserPage.jsx': 'col-md',
  'SearchPage.jsx': 'col-md',
  'MusicPage.jsx': 'col-md',
  'RecommendPage.jsx': 'col-md',
  'TestsPage.jsx': 'col-sm',
};

const OPEN_DIV = /^(\s*)<div className="max-w-(?:7xl|6xl|5xl|4xl) mx-auto (?:px-4 )?(py-[^\s"]+)(?: md:[^\s"]+)?">\r?$/gm;
/* 已经是 <main> 的（HotPage/MusicPage/ToolsPage）：收尾本来就在，只换 class */
const OPEN_MAIN = /^(\s*)<main className="max-w-(?:7xl|6xl|5xl|4xl) mx-auto (?:px-4 )?(py-[^\s"]+)(?: md:[^\s"]+)?">\r?$/gm;

const padOf = (py) => (py === 'py-6' || py === 'py-12' ? 'py-8' : py);

const report = [];
for (const entry of fs.readdirSync(PAGES)) {
  if (!/\.jsx$/.test(entry)) continue;
  const file = path.join(PAGES, entry);
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  let opens = 0;

  const repl = (_m, indent, py) => {
    opens++;
    const col = NARROW[entry];
    return `${indent}<main className="wrap ${padOf(py)}${col ? ' ' + col : ''}">`;
  };
  src = src.replace(OPEN_DIV, repl).replace(OPEN_MAIN, (m, i, py) => repl(m, i, py));

  if (opens) {
    /* 换成了 <main> 就必须有对应数量的 </main>：
       旧收尾是恰好 6 个空格缩进的 </div>（内层嵌套都比它更深） */
    const need = (src.match(/<main\b/g) || []).length - (src.match(/<\/main>/g) || []).length;
    if (need > 0) {
      let idx = 0;
      for (let i = 0; i < need; i++) {
        const re = /^      <\/div>/m;
        re.lastIndex = idx;
        const m = re.exec(src);
        if (!m) {
          console.log(`!! ${entry}: 缺 ${need - i} 个 </main> 收尾，整个文件跳过`);
          src = before;
          break;
        }
        idx = m.index + '</main>'.length;
        src = src.slice(0, m.index) + '      </main>' + src.slice(m.index + m[0].length);
      }
    }
  }

  if (src !== before) {
    report.push(entry + ` (${opens})`);
    if (WRITE) fs.writeFileSync(file, src);
  }
}
console.log(`${WRITE ? '已写入' : 'DRY-RUN'}：${report.length} 个文件`);
report.forEach((r) => console.log('  ' + r));
