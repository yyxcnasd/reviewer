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
    const inScopeOf = (term) => chapters.filter((ch) => ch.terms[term] !== 'out')
    const qCount = (ctx.qByCourse.get(course.id) || []).length

    const outline = chapters
      .map((ch) => {
        const secs = ch.sections
          .map(
            (s) =>
              `<li class="${s.state === 'in' ? 'sec-in' : s.state === 'boundary' ? 'sec-boundary' : 'sec-out'}" data-states="${attr(JSON.stringify(s.terms || {}))}" data-sec>${esc(s.no)} ${esc(s.title)}</li>`,
          )
          .join('')
        // 链接全部渲染，由轮次开关决定显示/隐藏（否则期末章在期末也没有入口）
        const links = `<div class="chapter__links" data-chapter-links>
                 ${ch.note ? `<a href="${url(1, `notes/${ch.id}.html`)}">读要点</a>` : ''}
                 ${ch.count ? `<a href="${url(1, `questions/?chapter=${ch.id}`)}">做这 ${ch.count} 道题</a>` : ''}
                 ${ch.count ? `<a href="${url(1, `export/?chapter=${ch.id}`)}">导出</a>` : ''}
               </div>`
        return `<article class="chapter" id="ch-${ch.id}" data-states="${attr(JSON.stringify(ch.terms || {}))}">
          <h2 class="chapter__title">${(() => {
          const href = ch.note
            ? url(1, `notes/${ch.id}.html`)
            : ch.count
              ? url(1, `questions/?chapter=${ch.id}`)
              : ''
          const inner = `${ch.no ? `<em>${esc(ch.no)}</em>` : ''}${esc(ch.title)}`
          return href ? `<a href="${href}">${inner}</a>` : inner
        })()}</h2>
          <span class="chapter__label chapter__label--${ch.state}" data-states="${attr(JSON.stringify(ch.terms || {}))}" data-chip>${stateLabel(ch.state)}</span>
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
        <p data-only="midterm"><b>${esc(course.scope_midterm || course.scope_line || '')}</b></p>
        <p data-only="final"><b>${esc(course.scope_final || course.scope_line || '')}</b></p>
        <p data-only="midterm">${esc(course.scope_note_midterm || course.scope_note || '')}</p>
        <p data-only="final">${esc(course.scope_note_final || course.scope_note || '')}</p>
        <div class="pagehead__stats">
          <span data-only="midterm"><b>${inScopeOf('midterm').length}</b>章在范围内</span>
          <span data-only="final"><b>${inScopeOf('final').length}</b>章在范围内</span>
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
      ${course.terms && !course.terms.includes('midterm')
        ? `<p class="course__term-less" data-only="midterm">这门课只有期末，期中不考它。</p>`
        : ''}
      <h2>考纲</h2>
      <p>${esc(course.notes_intro || '')}</p>
      <p>深色在范围内，红色是部分在范围，浅灰不在本轮范围。</p>
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

