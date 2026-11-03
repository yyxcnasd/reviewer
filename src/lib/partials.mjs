/**
 * 页面里反复出现的几块结构：面包屑、页头、题目行、标签、下拉选项。
 * 一处改动，所有页面跟着变——这些原本在每个 build* 里各写了一遍。
 */
import { url, esc, attr, dots, stateLabel, tagHref, stemExcerpt } from './layout.mjs'
import { chapterOf } from './text.mjs'

const SEP = '<span class="crumb__sep">/</span>'

/** 面包屑：parts = [{ href: 'questions/', label: '题库' }, { label: '第 3 章' }] */
export function crumb(depth, parts) {
  const html = parts
    .map((p) =>
      p.href === undefined || p.href === null
        ? `<span>${esc(p.label)}</span>`
        : `<a href="${url(depth, p.href)}">${esc(p.label)}</a>`,
    )
    .join(SEP)
  return `<nav class="crumb" aria-label="位置">${html}</nav>`
}

/** 页头：大标题 + 一句说明 + 统计 */
export function pageHead({ title, lead, stats = [], className = '' }) {
  const statsHtml = stats.length
    ? `<div class="pagehead__stats">${stats.filter(Boolean).join('')}</div>`
    : ''
  return `<header class="pagehead ${className}">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">${esc(title)}</h1>
      ${
        lead || statsHtml
          ? `<div class="pagehead__scope">${lead ? `<p>${lead}</p>` : ''}${statsHtml}</div>`
          : ''
      }
    </div>
  </header>`
}

export function stat(html) {
  return `<span>${html}</span>`
}

export function statCount(n, label) {
  return `<span><b>${n}</b>${esc(label)}</span>`
}

/** 标签 */
export function tagChips(tags, depth) {
  return tags.map((t) => `<a class="tag" href="${tagHref(depth, t)}">${esc(t)}</a>`).join('')
}

export function tagChipsList(tags, depth) {
  return tags.map((t) => `<li><a class="tag" href="${tagHref(depth, t)}">${esc(t)}</a></li>`).join('')
}

/** 记进度的两个按钮 */
export function progressFlags(q) {
  return `<div class="qrow__flags">
    <button class="flag" type="button" data-flag="done" data-id="${q.id}" aria-pressed="false"><span>已做</span></button>
    <button class="flag flag--fav" type="button" data-flag="fav" data-id="${q.id}" aria-pressed="false"><span>收藏</span></button>
  </div>`
}

/**
 * 题目行。列表页、科目页、标签页、笔记页都长这样，
 * 只有「要不要记进度」「右侧放不放标签」不同。
 */
export function questionRow(ctx, q, opts = {}) {
  const { depth = 1, flags = false, chapter = true, course = true, showId = false, tags = true } = opts
  const ch = chapterOf(ctx, q.chapter)
  const short = ctx.courseById.get(q.course)?.short || ''
  const where = [course ? esc(short) : '', chapter ? esc(ch.title) : ''].filter(Boolean).join(' · ')
  const meta = [
    showId ? `<span class="fq__id">${esc(q.id.toUpperCase())}</span>` : '',
    where ? `<span>${where}</span>` : '',
    `<span>${esc(q.kind)}</span>`,
    dots(q.difficulty),
  ]
    .filter(Boolean)
    .join('')

  return `<li class="qrow" data-id="${q.id}" data-course="${q.course}" data-chapter="${q.chapter}" data-states="${attr(JSON.stringify(ch.terms || {}))}" data-difficulty="${q.difficulty}" data-tags="${attr(q.tags.join(' '))}" data-text="${attr(q.searchText || '')}">
        <div>
          <a class="qrow__link" href="${url(depth, `questions/${q.id}.html`)}">${stemExcerpt(ctx, q)}</a>
          <div class="qrow__meta">${meta}</div>
          ${flags ? progressFlags(q) : ''}
        </div>
        ${tags ? `<div class="qrow__tags">${tagChips(q.tags, depth)}</div>` : ''}
      </li>`
}

/* ---------------------------------------------------------------- 下拉选项 */

export function courseOptions(ctx, { all = true } = {}) {
  return (
    (all ? '<option value="">全部</option>' : '') +
    ctx.courses.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')
  )
}

export function chapterOptions(ctx, { all = true } = {}) {
  const groups = ctx.courses
    .map((c) => {
      const chapters = c.chapters.filter((ch) => (ctx.qByChapter.get(ch.id) || []).length)
      if (!chapters.length) return ''
      return `<optgroup label="${esc(c.name)}">${chapters
        .map((ch) => `<option value="${ch.id}">第 ${esc(ch.no)} 章 ${esc(ch.title)}</option>`)
        .join('')}</optgroup>`
    })
    .join('')
  return (all ? '<option value="">全部</option>' : '') + groups
}

export function tagOptions(ctx, { all = true, withCount = true } = {}) {
  const entries = [...ctx.tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))
  return (
    (all ? '<option value="">全部</option>' : '') +
    entries
      .map(([t, n]) => `<option value="${attr(t)}">${esc(t)}${withCount ? `（${n}）` : ''}</option>`)
      .join('')
  )
}

export const DIFFICULTIES = ['1 基础', '2 常规', '3 综合', '4 挑战']

export function difficultyOptions({ all = true } = {}) {
  return (
    (all ? '<option value="">全部</option>' : '') +
    DIFFICULTIES.map((label, i) => `<option value="${i + 1}">${label}</option>`).join('')
  )
}

export function stateChip(state) {
  return `<span class="chip chip--${state}">${stateLabel(state)}</span>`
}
