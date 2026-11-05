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
  // 404 会出现在任意深度，链接一律走站点根的绝对路径
  const root = new URL(ctx.config.siteUrl || '/', 'https://x/').pathname.replace(/index\.html$/, '')
  const home = root
  const body = `
<div class="frame">
  <div class="section notfound">
    <p class="notfound__code">404</p>
    <h1>这一页不在册子里</h1>
    <p class="lede">地址可能写错了，也可能这一页还没建好。<b>6 秒后自动回首页</b>，也可以直接点下面。</p>
    <div class="notfound__actions">
      <a class="btn btn--red" href="${home}">回首页</a>
      <a class="btn btn--tone" href="${root}questions/">去题库</a>
    </div>
    <form class="search notfound__search" action="${root}questions/" method="get" role="search">
      <label class="sr-only" for="q">搜题</label>
      <input class="search__input" id="q" name="q" type="search" placeholder="搜题：题干、标签、出处" autocomplete="off">
      <button class="btn" type="submit">搜一搜</button>
    </form>
  </div>
</div>
<meta http-equiv="refresh" content="6; url=${home}">
<script>
  setTimeout(function () { location.replace('${home}') }, 6000)
</script>`
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
        terms: ch.terms,
        href: ch.note ? `notes/${ch.id}.html` : `${c.id}/#ch-${ch.id}`,
        count: ch.count,
        sections: ch.sections.map((s) => ({ no: s.no, title: s.title, state: s.state, terms: s.terms, keywords: s.keywords || [] })),
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
    // 该题所在章节在两个轮次下的状态（刷题页要按当前轮次过滤）
    states: chapterOf(ctx, q.chapter).terms || {},
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
