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

/* ---------------------------------------------------------------- 题库 */

export function buildQuestionIndex(ctx) {
  const { courses, questions } = ctx



  const rows = questions.map((q) => questionRow(ctx, q, { showId: true, flags: true })).join('\n      ')

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '题库' }])}
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">题库</h1>
      <div class="pagehead__scope">
        <p>${questions.length} 道题，按科目、章节、标签和难度筛。每题都有提示、完整解析和一条最常见的错法。</p>
        <div class="pagehead__stats">
          ${courses.map((c) => `<span><b>${(ctx.qByCourse.get(c.id) || []).length}</b>${esc(c.name)}</span>`).join('')}
          <span><a href="${url(1, 'practice/')}">进刷题模式 →</a></span>
        </div>
      </div>
    </div>
  </header>

  </div>
  <div class="index-field">
    <div class="frame">
    <form class="filters" id="filters" role="search" onsubmit="return false">
    <div class="filters__field">
      <label for="f-course">科目</label>
      <select id="f-course">${courseOptions(ctx)}</select>
    </div>
    <div class="filters__field">
      <label for="f-chapter">章节</label>
      <select id="f-chapter">${chapterOptions(ctx)}</select>
    </div>
    <div class="filters__field">
      <label for="f-tag">标签</label>
      <select id="f-tag">${tagOptions(ctx)}</select>
    </div>
    <div class="filters__field">
      <label for="f-difficulty">难度</label>
      <select id="f-difficulty">${difficultyOptions()}</select>
    </div>
    <div class="filters__field">
      <label for="f-status">状态</label>
      <select id="f-status">
        <option value="">全部</option>
        <option value="undone">还没做</option>
        <option value="done">做过了</option>
        <option value="fav">收藏的</option>
      </select>
    </div>
    <div class="filters__field">
      <label for="f-sort">排序</label>
      <select id="f-sort">
        <option value="chapter">按章节</option>
        <option value="easy">难度从低到高</option>
        <option value="hard">难度从高到低</option>
      </select>
    </div>
    <div class="filters__field">
      <label for="f-q">搜索</label>
      <input id="f-q" type="search" placeholder="题干、标签、出处" autocomplete="off">
    </div>
    <div class="filters__field">
      <label>&nbsp;</label>
      <button class="btn btn--tone" type="button" id="f-export">导出筛选结果</button>
    </div>
    <div class="filters__count"><b id="f-count">${questions.length}</b> 道</div>
  </form>

  <p class="donebar" data-progress-ids="${attr(questions.map((q) => q.id).join(','))}">
    已做 <b data-progress-here>0</b> / ${questions.length}
    <span>·</span> 收藏 <b data-progress-count>0</b>
    <span>·</span> 点每道题下面的「已做」「收藏」记录进度，只存在你自己的浏览器里
    <span>·</span> 按 <span class="kbd">/</span> 直接搜索
  </p>

  <ul class="qlist" id="qlist">
      ${rows}
  </ul>
  <p class="empty" id="qlist-empty" hidden>没有符合条件的题。换个筛选条件试试。</p>
  <noscript><p class="hint">筛选需要 JavaScript；上面的列表已经包含全部 ${questions.length} 道题，可以直接点开。</p></noscript>
    </div>
  </div>
</div>
`
  write(ctx, 'questions/index.html', page(ctx, { depth: 1, title: '题库', description: `${questions.length} 道微积分 A1 与线性代数题目，带完整解析。`, body, bodyClass: 'detail', navActive: 'questions' }))
}

/* ---------------------------------------------------------------- 题目页 */

export function buildQuestionPages(ctx) {
  const byCourse = new Map()
  for (const q of ctx.questions) {
    if (!byCourse.has(q.course)) byCourse.set(q.course, [])
    byCourse.get(q.course).push(q)
  }

  for (const q of ctx.questions) {
    const ch = chapterOf(ctx, q.chapter)
    const course = ctx.courseById.get(q.course)
    const list = byCourse.get(q.course)
    const idx = list.findIndex((x) => x.id === q.id)
    const prev = list[idx - 1]
    const next = list[idx + 1]
    const sameChapter = (ctx.qByChapter.get(q.chapter) || []).filter((x) => x.id !== q.id).slice(0, 5)

    const stem = ctx.renderMarkdown(q.stem, { errors: ctx.errors })
    const solution = ctx.renderMarkdown(q.solution, { errors: ctx.errors })
    const hint = q.hint ? ctx.renderMarkdown(q.hint, { errors: ctx.errors }) : ''
    const mistakes = q.mistakes ? ctx.renderMarkdown(q.mistakes, { errors: ctx.errors }) : ''
    const answerHtml = q.answer ? ctx.renderMarkdown(q.answer, { errors: ctx.errors }) : ''

    const body = `
<div class="frame">
  ${crumb(1, [
    { href: '', label: ctx.config.wordmark },
    { href: 'questions/', label: '题库' },
    { href: `${course.id}/`, label: course.name },
    { label: `第 ${ch.no} 章` },
  ])}

  <div class="qpage">
    <div class="qpage__main">
      <header class="pagehead pagehead--q">
        <h1 class="qpage__title">${esc(ch.title)} · ${esc(q.kind)}</h1>
        <div class="meta" style="margin-top:14px">
          <span class="meta__item">${esc(course.name)}</span>
          <span class="meta__item">${esc(q.kind)}</span>
          <span class="meta__item">难度 ${dots(q.difficulty)}</span>
          <span class="meta__item">${esc(q.source)}</span>
          ${q.origin ? `<span class="meta__item">投稿：${esc(q.origin)}</span>` : ''}
        </div>
        <div class="qactions">
          <button class="flag" type="button" data-flag="done" data-id="${q.id}" aria-pressed="false"><span>已做</span></button>
          <button class="flag flag--fav" type="button" data-flag="fav" data-id="${q.id}" aria-pressed="false"><span>收藏</span></button>
          <button class="ghost" type="button" id="expand-all">展开解析与提示</button>
          <button class="ghost" type="button" id="copy-md">复制题目</button>
          <a class="ghost" href="${url(1, `export/?ids=${q.id}`)}">导出这道题</a>
          <span class="qactions__id">${esc(q.id.toUpperCase())} · <span class="kbd">←</span><span class="kbd">→</span> 翻题 · <span class="kbd">E</span> 展开 · <span class="kbd">D</span> 记已做</span>
        </div>
      </header>

      <div class="qpage__stem prose">${stem}</div>

      ${hint ? `<details class="qblock qblock--hint"><summary>提示<span aria-hidden="true">+</span></summary><div class="qblock__body prose">${hint}</div></details>` : ''}

      <details class="qblock" id="solution">
        <summary>解析（先自己做一遍再看）<span aria-hidden="true">展开</span></summary>
        <div class="qblock__body prose">
          ${answerHtml ? `<div class="answer"><span>答案</span>${answerHtml}</div>` : ''}
          ${solution}
        </div>
      </details>

      ${mistakes ? `<details class="qblock"><summary>常见错误<span aria-hidden="true">展开</span></summary><div class="qblock__body prose">${mistakes}</div></details>` : ''}

      <div class="pager" data-pager>
        ${prev ? `<a class="pager__prev" href="${url(1, `questions/${prev.id}.html`)}"><span>上一题</span>${esc(shortLabel(prev))}</a>` : '<span class="pager__prev"></span>'}
        ${next ? `<a class="pager__next" href="${url(1, `questions/${next.id}.html`)}"><span>下一题</span>${esc(shortLabel(next))}</a>` : '<span class="pager__next"></span>'}
      </div>
    </div>

    <aside class="qpage__side">
      <div>
        <h2>这道题</h2>
        <dl class="spec">
          <div><dt>科目</dt><dd>${esc(course.name)}</dd></div>
          <div><dt>章节</dt><dd>${esc(ch.title)}</dd></div>
          <div><dt>题型</dt><dd>${esc(q.kind)}</dd></div>
          <div><dt>难度</dt><dd>${dots(q.difficulty)}</dd></div>
          <div><dt>出处</dt><dd>${esc(q.source)}</dd></div>
          <div><dt>范围</dt><dd>${esc(stateLabel(ch.state))}</dd></div>
        </dl>
      </div>
      <div>
        <h2>考点</h2>
        <ul class="tag-list">${q.tags.map((t) => `<li><a class="tag" href="${tagHref(1, t)}">${esc(t)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2>往下走</h2>
        <ul class="sidelist">
          ${ch.note ? `<li><a href="${url(1, `notes/${ch.id}.html`)}">读这一章的要点</a></li>` : ''}
          <li><a href="${url(1, `questions/?chapter=${ch.id}`)}">这一章的 ${ctx.qByChapter.get(ch.id).length} 道题</a></li>
          <li><a href="${url(1, `export/?chapter=${ch.id}`)}">导出这一章</a></li>
          <li><a href="${url(1, `${course.id}/#ch-${ch.id}`)}">这一章在考纲里的位置</a></li>
        </ul>
      </div>
      ${
        sameChapter.length
          ? `<div>
        <h2>同一章</h2>
        <ul class="sidelist">
          ${sameChapter.map((x) => `<li><a href="${url(1, `questions/${x.id}.html`)}">${esc(shortLabel(x))}</a></li>`).join('')}
        </ul>
      </div>`
          : ''
      }
    </aside>
  </div>
</div>
`
    write(
      ctx,
      `questions/${q.id}.html`,
      page(ctx, {
        depth: 1,
        title: `${ch.title} · ${q.kind}`,
        description: q.searchText,
        body,
        bodyClass: 'detail',
        navActive: 'questions',
      }),
    )
  }
}
