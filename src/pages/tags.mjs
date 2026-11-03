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

/* ---------------------------------------------------------------- 标签页 */

export function buildTagPages(ctx) {
  const entries = [...ctx.tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '标签' }])}
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">标签</h1>
      <div class="pagehead__scope">
        <p>题库按考点打了标签，一个标签就是一个可以单独过一遍的小专题。</p>
      </div>
    </div>
  </header>
  <section class="section--tight">
    <ul class="tagcloud">
      ${entries.map(([t, n]) => `<li><a href="${tagHref(1, t)}">${esc(t)}<b>${n}</b></a></li>`).join('')}
    </ul>
  </section>
</div>`
  write(ctx, 'tags/index.html', page(ctx, { depth: 1, title: '标签', description: '按考点浏览题库标签。', body, bodyClass: 'detail' }))

  for (const [tag, n] of entries) {
    const qs = ctx.questions.filter((q) => q.tags.includes(tag))
    const rows = qs.map((q) => questionRow(ctx, q, { tags: false })).join('')
    const tbody = `
<div class="frame">
  <nav class="crumb" aria-label="位置"><a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><a href="${url(1, 'tags/')}">标签</a><span class="crumb__sep">/</span><span>${esc(tag)}</span></nav>
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">${esc(tag)}</h1>
      <div class="pagehead__scope"><p>${n} 道题带这个标签。</p></div>
    </div>
  </header>
  <ul class="qlist">${rows}</ul>
  <p class="more">
    <a class="btn btn--red" href="${url(1, `export/?tag=${encodeURIComponent(tag)}`)}">导出这 ${n} 道（PDF）</a>
    <a href="${url(1, 'tags/')}">← 回到全部标签</a>
  </p>
</div>`
    write(ctx, `tags/${tag}.html`, page(ctx, { depth: 1, title: `标签：${tag}`, description: `带「${tag}」标签的 ${n} 道题。`, body: tbody, bodyClass: 'detail', navActive: 'questions' }))
  }
}
