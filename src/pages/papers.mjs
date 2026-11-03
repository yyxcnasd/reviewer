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

/* ---------------------------------------------------------------- 真题 */

export function buildPapers(ctx) {
  const { courses, papers } = ctx
  const byCourse = new Map()
  for (const p of papers) {
    if (!byCourse.has(p.course)) byCourse.set(p.course, [])
    byCourse.get(p.course).push(p)
  }

  const blocks = courses
    .map((c) => {
      const list = (byCourse.get(c.id) || []).sort((a, b) => a.year - b.year)
      if (!list.length) return ''
      return `<section class="section--tight">
        <div class="rule-head"><h2>${esc(c.name)}</h2><p>${list.length} 套卷子的题型与考点索引。</p></div>
        <div class="papers">
          ${list
            .map(
              (p) => `<article class="paper">
            <div class="paper__head">
              <h3 class="paper__title">${esc(p.title)}</h3>
              <p class="paper__meta">${esc(p.date || p.year)} · ${esc(p.source || '')}</p>
            </div>
            <ul class="paper__sections">
              ${(p.sections || [])
                .map(
                  (s) =>
                    `<li>${esc(s.name)} <b>${esc(s.count)} 题${s.points ? ` · ${esc(s.points)} 分` : ''}</b></li>`,
                )
                .join('')}
            </ul>
            <ul class="paper__topics">
              ${(p.topics || [])
                .map(
                  (t) =>
                    `<li><a href="${url(1, `${c.id}/#ch-${t.chapter}`)}">${esc(t.label)}</a></li>`,
                )
                .join('')}
            </ul>
            ${p.notes ? `<p class="paper__note">${esc(p.notes)}</p>` : ''}
          </article>`,
            )
            .join('\n')}
        </div>
      </section>`
    })
    .join('')

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '真题' }])}
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">真题索引</h1>
      <div class="pagehead__scope">
        <p>${papers.length} 套历年期中卷：题型怎么分、每道题考哪一章。卷子原文不在站内，这里只做索引与统计，用来对表自己的复习。</p>
      </div>
    </div>
  </header>
  <div class="article__main prose" style="max-width:44em;margin-bottom:56px">
    ${ctx.papersNotesHtml}
  </div>
  ${blocks}
  <p class="hint" style="margin-top:40px">索引依据公开整理的历年试卷（mathsdream/THU-math-source 等）。范围以任课教师通知为准。</p>
</div>`
  write(ctx, 'papers/index.html', page(ctx, { depth: 1, title: '真题索引', description: `${papers.length} 套微积分 A1 与线性代数期中卷的题型与考点索引。`, body, bodyClass: 'detail', navActive: 'papers' }))
}
