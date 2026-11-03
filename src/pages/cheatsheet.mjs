import fs from 'node:fs'
import path from 'node:path'

import {
  page,
  write,
  url,
  esc,
  attr,
  dots,
  stateLabel,
  tagHref,
  stemExcerpt,
  shortLabel,
  shortTitle,
  chapterOf,
  crumb,
  pageHead,
  stat,
  statCount,
  tagChips,
  tagChipsList,
  progressFlags,
  questionRow,
  courseOptions,
  chapterOptions,
  tagOptions,
  difficultyOptions,
  DIFFICULTIES,
  stateChip,
} from '../lib/site.mjs'

/* ---------------------------------------------------------------- 速查表 */

export function buildCheatsheet(ctx) {
  const file = path.join(ctx.CONTENT, 'cheatsheet.md')
  if (!fs.existsSync(file)) return
  const src = fs.readFileSync(file, 'utf8')
  const headings = []
  const html = ctx.renderMarkdown(src, { errors: ctx.errors, headings })

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '速查' }])}
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">速查表</h1>
      <div class="pagehead__scope">
        <p>两门课最常用的一批结论：等价无穷小、麦克劳林展开、求导与中值定理、行列式与逆矩阵、线性相关性。考前十分钟扫一遍，打印出来带走也行。</p>
        <div class="pagehead__stats">
          <span><b>${headings.length}</b>组结论</span>
          <span>适合打印（A4 双栏）</span>
          <span><button class="ghost" type="button" data-print>打印</button></span>
          <span><a href="${url(1, 'questions/')}">去做题 →</a></span>
        </div>
      </div>
    </div>
  </header>

  <div class="sheet">
    <div class="sheet__body prose">
      ${html}
    </div>
  </div>
</div>
${'<script src="' + url(1, 'assets/print.js') + '" defer></script>'}`
  write(ctx, 'cheatsheet/index.html', page(ctx, { depth: 1, title: '速查表', description: '微积分 A1 与线性代数的常用结论速查：等价无穷小、麦克劳林、中值定理、行列式、逆矩阵、线性相关。', body, bodyClass: 'detail', navActive: 'cheatsheet' }))
}
