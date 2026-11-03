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

/* ---------------------------------------------------------------- 要点页 */

export function buildNotes(ctx) {
  const ordered = [...ctx.notes].sort((a, b) => a.chapter.order - b.chapter.order)
  ordered.forEach((note, idx) => {
    const headings = []
    const html = ctx.renderMarkdown(note.body, { errors: ctx.errors, headings })
    const prev = ordered[idx - 1]
    const next = ordered[idx + 1]
    const ch = note.chapter
    const qs = ctx.qByChapter.get(ch.id) || []

    const tocRail = `<nav class="article__toc" data-ui aria-label="本页目录">
          <h2>本页</h2>
          ${
            headings.length
              ? `<ol>${headings
                  .map(
                    (h) =>
                      `<li class="${h.level === 3 ? 'is-sub' : ''}"><a href="#${h.id}">${esc(h.text)}</a></li>`,
                  )
                  .join('')}</ol>`
              : ''
          }
          <dl class="spec spec--rail">
            <div><dt>章节</dt><dd>第 ${esc(ch.no)} 章</dd></div>
            <div><dt>节</dt><dd>${ch.sections.filter((s) => s.state !== 'out').length} 节在范围内</dd></div>
            <div><dt>题</dt><dd>${qs.length} 道</dd></div>
            <div><dt>范围</dt><dd>${esc(stateLabel(ch.state))}</dd></div>
          </dl>
        </nav>`

    const body = `
<div class="frame">
  <nav class="crumb" aria-label="位置">
    <a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a>
    <span class="crumb__sep">/</span>
    <a href="${url(1, note.course.id + '/')}">${esc(note.course.name)}</a>
    <span class="crumb__sep">/</span>
    <span>第 ${esc(ch.no)} 章</span>
  </nav>

  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">${esc(note.title)}</h1>
      <div class="pagehead__scope">
        <p>${esc(note.lead)}</p>
        <div class="pagehead__stats">
          <span>${esc(stateLabel(ch.state))}</span>
          <span><b>${qs.length}</b>道题在这一章</span>
          <span data-progress-ids="${attr(qs.map((q) => q.id).join(','))}">本章已做 <b data-progress-here>0</b> / ${qs.length}</span>
          <span><button class="ghost" type="button" data-print>打印这一章</button></span>
        </div>
      </div>
    </div>
  </header>
</div>

<div class="frame article">
  <div class="article__main prose">
    ${html}
    ${
      qs.length
        ? `<div class="rule-head" style="margin-top:56px"><h2>这一章的题</h2><p>${qs.length} 道，全部带解析。</p></div>
           <ul class="qmini">
             ${qs
               .map(
                 (q) => `<li><a href="${url(1, `questions/${q.id}.html`)}">${esc(shortLabel(q))}</a> <span>${esc(q.kind)} · ${esc(q.tags[0] || '')}</span></li>`,
               )
               .join('')}
           </ul>`
        : ''
    }
    <div class="article__pager">
      ${prev ? `<a href="${url(1, `notes/${prev.id}.html`)}">← 第 ${esc(prev.chapter.no)} 章 ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a href="${url(1, `notes/${next.id}.html`)}">第 ${esc(next.chapter.no)} 章 ${esc(next.title)} →</a>` : '<span></span>'}
    </div>
  </div>
  ${tocRail}
</div>
`
    write(ctx, `notes/${note.id}.html`, page(ctx, { depth: 1, title: `${note.title} · ${note.course.name}`, description: note.lead, body, bodyClass: 'detail', navActive: note.course.id }))
  })
}
