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

/* ---------------------------------------------------------------- 404 */

export function buildNotFound(ctx) {
  const body = `
<div class="frame">
  <div class="section">
    <h1 style="max-width:14em">这一页不在册子里</h1>
    <p class="lede" style="margin-top:24px">地址可能写错了，或者这一章还没整理。</p>
    <p style="margin-top:36px"><a class="btn btn--red" href="${url(0, 'questions/')}">去题库</a></p>
    <ul style="margin-top:48px;list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:20px 40px">
      <li><a href="${url(0, 'va1/')}">微积分 A1</a></li>
      <li><a href="${url(0, 'la/')}">线性代数</a></li>
      <li><a href="${url(0, 'papers/')}">真题索引</a></li>
    </ul>
  </div>
</div>`
  write(ctx, '404.html', page(ctx, { depth: 0, title: '页面不存在', body, bodyClass: 'detail' }))
}

/* ---------------------------------------------------------------- 数据 */

export function buildData(ctx) {
  const scope = {
    courses: ctx.courses.map((c) => ({
      id: c.id,
      name: c.name,
      short: c.short,
      scope: c.scope_line,
      chapters: c.chapters.map((ch) => ({
        id: ch.id,
        no: ch.no,
        title: ch.title,
        short: shortTitle(ch),
        state: ch.state,
        href: ch.note ? `notes/${ch.id}.html` : `${c.id}/#ch-${ch.id}`,
        count: ch.count,
        sections: ch.sections.map((s) => ({ no: s.no, title: s.title, state: s.state, keywords: s.keywords || [] })),
      })),
    })),
  }
  write(ctx, 'data/scope.json', JSON.stringify(scope))

  // 刷题 / 导出页只要元数据；题面与解析按题单独取，避免一进页面就下几 MB
  const courseOrder = new Map(ctx.courses.map((course, i) => [course.id, i]))
  const ordered = ctx.questions
    .slice()
    .sort((a, b) => (courseOrder.get(a.course) - courseOrder.get(b.course)) || a.id.localeCompare(b.id))
  const index = ordered.map((q) => ({
    id: q.id,
    course: q.course,
    chapter: q.chapter,
    chapterTitle: chapterOf(ctx, q.chapter).title,
    courseShort: ctx.courseById.get(q.course).short,
    tags: q.tags,
    difficulty: q.difficulty,
    kind: q.kind,
    text: q.title,
    excerptHtml: stemExcerpt(ctx, q),
    url: `questions/${q.id}.html`,
  }))
  write(ctx, 'data/questions.json', JSON.stringify(index))

  for (const q of ctx.questions) {
    write(
      ctx,
      `data/q/${q.id}.json`,
      JSON.stringify({
        id: q.id,
        stemHtml: ctx.renderMarkdown(q.stem, { errors: ctx.errors }),
        hintHtml: q.hint ? ctx.renderMarkdown(q.hint, { errors: ctx.errors }) : '',
        solutionHtml: ctx.renderMarkdown(q.solution, { errors: ctx.errors }),
        mistakesHtml: q.mistakes ? ctx.renderMarkdown(q.mistakes, { errors: ctx.errors }) : '',
        answerHtml: q.answer ? ctx.renderMarkdown(q.answer, { errors: ctx.errors }) : '',
      }),
    )
  }
}

/* ---------------------------------------------------------------- 其它 */

export function buildExtras(ctx) {
  const { config } = ctx
  const pages = ctx.written.filter((p) => p.endsWith('.html') && p !== '404.html')
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) =>
      `  <url><loc>${config.siteUrl.replace(/\/$/, '')}/${p.replace(/index\.html$/, '')}</loc></url>`,
  )
  .join('\n')}
</urlset>`
  write(ctx, 'sitemap.xml', sitemap)
  write(ctx, 'robots.txt', `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl.replace(/\/$/, '')}/sitemap.xml\n`)
  write(ctx, '.nojekyll', '')

  write(
    ctx,
    'assets/favicon.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f3f1ec"/><circle cx="32" cy="32" r="21" fill="none" stroke="#c1121f" stroke-width="9"/></svg>`,
  )
}
