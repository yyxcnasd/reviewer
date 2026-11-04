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
    const rawHtml = ctx.renderMarkdown(note.body, { errors: ctx.errors, headings })
    const html = withLabels(rawHtml)

    // 本章速览：把小节（h3）列在正文前面，手机上也有个索引
    const subs = headings.filter((h) => h.level === 3)
    const glance = subs.length
      ? `<div class="note-glance">
        <h2>本章速览</h2>
        <ol>${subs.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol>
      </div>`
      : ''
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
    ${glance}
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

/**
 * 把「定义：」「定理：」「注意：」这类开头包成带标签的段落，
 * 只是给已有的写法加一层可扫读的结构，不改内容。
 */
const LABELS = ['定义', '定理', '性质', '结论', '推论', '注意', '易错', '警告', '例', '例题', '常用手法', '记法', '提示']

function withLabels(html) {
  const names = LABELS.join('|')
  return html.replace(
    new RegExp(`<p>(${names})([：:])\\s*`, 'g'),
    (m, label) => `<p class="nb nb--${label}"><span class="nb__label">${label}</span>`,
  )
}
