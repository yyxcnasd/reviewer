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

/* ---------------------------------------------------------------- 科目页 */

export function buildCourses(ctx) {
  for (const course of ctx.courses) {
    const chapters = course.chapters
    const inScope = chapters.filter((c) => c.state !== 'out')
    const qCount = (ctx.qByCourse.get(course.id) || []).length

    const outline = chapters
      .map((ch) => {
        const secs = ch.sections
          .map(
            (s) =>
              `<li class="${s.state === 'in' ? 'sec-in' : s.state === 'boundary' ? 'sec-boundary' : 'sec-out'}">${esc(s.no)} ${esc(s.title)}</li>`,
          )
          .join('')
        const links =
          ch.state === 'out'
            ? ''
            : `<div class="chapter__links">
                 ${ch.note ? `<a href="${url(1, `notes/${ch.id}.html`)}">读要点</a>` : ''}
                 ${ch.count ? `<a href="${url(1, `questions/?chapter=${ch.id}`)}">做这 ${ch.count} 道题</a>` : ''}
                 ${ch.count ? `<a href="${url(1, `export/?chapter=${ch.id}`)}">导出</a>` : ''}
               </div>`
        return `<article class="chapter" id="ch-${ch.id}">
          <h2 class="chapter__title"><em>${esc(ch.no)}</em>${esc(ch.title)}</h2>
          <span class="chapter__label chapter__label--${ch.state}">${stateLabel(ch.state)}</span>
          <p class="chapter__summary">${esc(ch.summary || '')}</p>
          <ul class="chapter__sections">${secs}</ul>
          ${links}
        </article>`
      })
      .join('\n')

    const body = `
<section class="pagehead field-${course.accent}">
  <div class="frame">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">${esc(course.name)}</h1>
      <div class="pagehead__scope">
        <p><b>${esc(course.scope_line)}</b></p>
        <p>${esc(course.scope_note)}</p>
        <div class="pagehead__stats">
          <span><b>${inScope.length}</b>章在范围内</span>
          <span><b>${qCount}</b>道题</span>
          <span><b>${ctx.notes.filter((n) => n.course.id === course.id).length}</b>篇要点</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="frame outline">
    <div class="outline__side">
      <h2>考纲</h2>
      <p>${esc(course.notes_intro || '')}</p>
      <p>颜色有含义：深色的在范围内，红色标签的是边界，浅灰的是期中之后。</p>
    </div>
    <div class="outline__body">
      ${outline}
    </div>
  </div>
</section>

<section class="section field-ink">
  <div class="frame">
    <div class="rule-head">
      <h2>这一册里${esc(course.short)}的部分</h2>
      <p>${qCount} 道题，每题都有解析；${ctx.notes.filter((n) => n.course.id === course.id).length} 篇要点按章节排。</p>
    </div>
    <ul class="qlist">
      ${(ctx.qByCourse.get(course.id) || [])
        .slice(0, 6)
        .map((q) => questionRow(ctx, q))
        .join('\n      ')}
    </ul>
    <p style="margin-top:28px"><a class="btn" href="${url(1, `questions/?course=${course.id}`)}">看全部 ${qCount} 道题</a></p>
  </div>
</section>
`
    write(ctx, `${course.id}/index.html`, page(ctx, { depth: 1, title: course.name, description: `${course.name}期中复习：${course.scope_line}。${course.scope_note}`, body, bodyClass: 'detail', navActive: course.id }))
  }
}

