import {
  page,
  write,
  url,
  esc,
  attr,
  crumb,
  courseOptions,
  chapterOptions,
  tagOptions,
  difficultyOptions,
} from '../lib/site.mjs'

/* ==========================================================================
   导出：选题页 + 打印版
   ========================================================================== */

const FONT_FACES = [400, 700, 900]
  .map(
    (w) => `@font-face {
  font-family: "Noto Serif SC";
  font-style: normal;
  font-weight: ${w};
  font-display: swap;
  src: url("../../assets/fonts/noto-serif-sc-${w}.woff2") format("woff2");
}`,
  )
  .join('\n')

export function buildExportPages(ctx) {
  buildSelector(ctx)
  buildPrint(ctx)
}

/* ---------------------------------------------------------------- 选题页 */

function buildSelector(ctx) {
  const { stats } = ctx


  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { href: 'questions/', label: '题库' }, { label: '导出' }])}

  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">导出 PDF</h1>
      <div class="pagehead__scope">
        <p>挑题，生成 A4 卷子；打印对话框里选「另存为 PDF」。</p>
        <div class="pagehead__stats">
          <span>单题 / 整门课 / 一章 / 一个标签 / 手选</span>
          <span>可只出题面，也可题面+解析+答案</span>
          <span><a href="${url(1, 'cheatsheet/')}">顺便打印速查表 →</a></span>
        </div>
      </div>
    </div>
  </header>

  <div class="export">
    <div class="export__list">
      <form class="exfilters" id="ex-filters" onsubmit="return false">
        <div class="exfilters__field">
          <label for="ex-course">科目</label>
          <select id="ex-course">${courseOptions(ctx)}</select>
        </div>
        <div class="exfilters__field">
          <label for="ex-chapter">章节</label>
          <select id="ex-chapter">${chapterOptions(ctx)}</select>
        </div>
        <div class="exfilters__field">
          <label for="ex-tag">标签</label>
          <select id="ex-tag">${tagOptions(ctx)}</select>
        </div>
        <div class="exfilters__field">
          <label for="ex-difficulty">难度</label>
          <select id="ex-difficulty">${difficultyOptions()}</select>
        </div>
        <div class="exfilters__field">
          <label for="ex-q">搜索</label>
          <input id="ex-q" type="search" placeholder="题干关键词" autocomplete="off">
        </div>
      </form>

      <div class="exbulk">
        <button type="button" data-ex="all">全选当前筛选</button>
        <button type="button" data-ex="none">全不选</button>
        <button type="button" data-ex="invert">反选</button>
        <span class="count">已选 <b id="ex-count">0</b> 道</span>
      </div>

      <div id="ex-list" aria-live="polite"><p class="hint">正在载入题库…</p></div>
    </div>

    <aside class="export__side">
      <div class="exopts">
        <h2>导出什么</h2>
        <div class="exopts__group">
          <p>内容</p>
          <div class="exopts__presets">
            <button type="button" data-preset="stem">只要题面</button>
            <button type="button" data-preset="full">题面 + 解析</button>
            <button type="button" data-preset="all">全都要</button>
          </div>
          <label class="excheck"><input type="checkbox" id="ex-hint"> 提示</label>
          <label class="excheck"><input type="checkbox" id="ex-solution"> 解析</label>
          <label class="excheck"><input type="checkbox" id="ex-answer"> 答案</label>
          <label class="excheck"><input type="checkbox" id="ex-mistakes"> 常见错误</label>
        </div>

        <div class="exopts__group">
          <p>版式</p>
          <label class="excheck"><input type="checkbox" id="ex-newpage"> 每题另起一页</label>
          <label class="excheck"><input type="checkbox" id="ex-work"> 题面后留答题空间</label>
          <label class="excheck"><input type="checkbox" id="ex-meta" checked> 每题标出章节与考点</label>
          <div class="exfilters__field">
            <label for="ex-size">字号</label>
            <select id="ex-size">
              <option value="small">小（省纸）</option>
              <option value="normal" selected>中</option>
              <option value="large">大（好读）</option>
            </select>
          </div>
        </div>
      </div>

      <div class="exactions">
        <button class="btn btn--red" type="button" id="ex-print">生成 PDF（新标签页）</button>
        <button class="btn" type="button" id="ex-print-same">在当前页打印</button>
        <button class="btn btn--tone" type="button" id="ex-copy">复制这个组合的链接</button>
        <button class="btn btn--tone" type="button" id="ex-clear">清空选择</button>
      </div>
      <p class="exsum" id="ex-sum"></p>
      <p class="exnote">选择记在本机；链接发给同学即是同一份卷子。</p>
    </aside>
  </div>
</div>
<script src="${url(1, 'assets/export.js')}" defer></script>`

  write(
    ctx,
    'export/index.html',
    page(ctx, {
      depth: 1,
      title: '导出 PDF',
      description: '按单题、科目、章节、标签或手选挑题，导出只含题面或题面加解析的 A4 PDF。',
      body,
      bodyClass: 'detail',
      navActive: 'questions',
    }),
  )
}

/* ---------------------------------------------------------------- 打印版 */

function buildPrint(ctx) {
  const scripts = `<script src="../../assets/export-print.js" defer></script>`
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>打印版 · ${esc(ctx.config.name)}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="../../assets/katex/katex.min.css">
<style>${FONT_FACES}</style>
<script src="../../assets/core.js"></script>
<script src="../../assets/term.js"></script>
<link rel="stylesheet" href="../../assets/print-sheet.css">
</head>
<body class="sheet-page">
<div class="psheet-tools">
  <button type="button" id="ps-print">打印 / 另存为 PDF</button>
  <button type="button" class="plain" id="ps-back">回到导出页</button>
  <button type="button" class="plain" id="ps-copy">复制这个链接</button>
  <span class="status" id="ps-status">正在载入题目…</span>
</div>
<main class="psheet" id="psheet">
  <header class="psheet__head">
    <h1 class="psheet__title">打印版</h1>
    <p class="psheet__meta">复习册 · 正在载入题目…</p>
  </header>
  <p class="psheet-empty">正在载入题目…</p>
</main>
${scripts}
</body>
</html>`
  write(ctx, 'export/print/index.html', html)
}
