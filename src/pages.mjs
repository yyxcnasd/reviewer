import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

import { stripMath } from './markdown.mjs'

import { page, write, url, esc, attr, stateLabel, dots, tagHref, stemExcerpt } from './layout.mjs'
import { buildHome } from './home.mjs'
import { buildExportPages } from './export-pages.mjs'

/* ==========================================================================
   复习册 · 页面生成
   ========================================================================== */

const SV = (p) => p // readability helper

export async function buildSite(ctx) {
  ctx.written = []
  prepare(ctx)
  buildHome(ctx)
  buildCourses(ctx)
  buildNotes(ctx)
  buildQuestionIndex(ctx)
  buildQuestionPages(ctx)
  buildTagPages(ctx)
  buildCheatsheet(ctx)
  buildExportPages(ctx)
  buildPapers(ctx)
  buildPractice(ctx)
  buildSubmit(ctx)
  buildAbout(ctx)
  buildNotFound(ctx)
  buildData(ctx)
  buildExtras(ctx)
  copyStatic(ctx)
  for (const w of ctx.warnings || []) {
    // 生成阶段的提示
  }
}

/* ---------------------------------------------------------------- 准备 */

function prepare(ctx) {
  const { questions, notes, courses, chapterById } = ctx

  const order = new Map()
  let i = 0
  for (const c of courses) for (const ch of c.chapters) order.set(ch.id, i++)

  ctx.qByCourse = new Map()
  ctx.qByChapter = new Map()
  for (const q of questions) {
    if (!ctx.qByCourse.has(q.course)) ctx.qByCourse.set(q.course, [])
    ctx.qByCourse.get(q.course).push(q)
    if (!ctx.qByChapter.has(q.chapter)) ctx.qByChapter.set(q.chapter, [])
    ctx.qByChapter.get(q.chapter).push(q)
  }

  ctx.notesByChapter = new Map(notes.map((n) => [n.id, n]))

  // 标签计数
  ctx.tagCounts = new Map()
  for (const q of questions) for (const t of q.tags) ctx.tagCounts.set(t, (ctx.tagCounts.get(t) || 0) + 1)

  // 真题
  const papersFile = path.join(ctx.CONTENT, 'papers.yml')
  ctx.papers = fs.existsSync(papersFile) ? (yaml.load(fs.readFileSync(papersFile, 'utf8'))?.papers ?? []) : []
  const papersNotesFile = path.join(ctx.CONTENT, 'papers-notes.md')
  ctx.papersNotesHtml = fs.existsSync(papersNotesFile)
    ? ctx.renderMarkdown(fs.readFileSync(papersNotesFile, 'utf8'), { errors: ctx.errors })
    : ''

  // 章节的题目数与链接
  for (const ch of chapterById.values()) {
    ch.count = (ctx.qByChapter.get(ch.id) || []).length
    ch.note = ctx.notesByChapter.get(ch.id)
    ch.order = order.get(ch.id)
  }

  // 首页示范题
  ctx.featured = ['va1-030', 'la-014', 'va1-042', 'la-050']
    .map((id) => ctx.questions.find((q) => q.id === id))
    .filter(Boolean)
}

/* ---------------------------------------------------------------- 首页 */

/* 列表与翻页用的短标签：把题面里的公式去掉，取开头一小段 */
function shortLabel(q) {
  const first = q.stem.split(/\n\s*\n/)[0] || q.stem
  const plain = stripMath(first)
    .replace(/[#*>`|]/g, ' ')
    .replace(/[，。、；：（）()\s]+/g, ' ')
    .trim()
  const cjk = (plain.match(/[\u4e00-\u9fff]/g) || []).length
  if (cjk >= 5) {
    const t = plain.slice(0, 22).trim()
    return t + (plain.length > 22 ? '…' : '')
  }
  return (q.tags[0] || q.kind) + ' · 难度 ' + q.difficulty
}

function shortTitle(ch) {
  const map = {
    'va1-1': '数列极限',
    'va1-2': '函数极限',
    'va1-3': '导数',
    'va1-4': '中值定理与泰勒',
    'va1-5': '黎曼积分',
    'va1-6': '广义积分',
    'va1-7': '常微分方程',
    'la-1': '行列式',
    'la-2': '矩阵',
    'la-3': '向量空间',
    'la-4': '秩与解的结构',
  }
  return map[ch.id] || ch.title
}

/* 生成面板里用的行内公式，避免在模板字符串里写反斜杠地狱 */
function sv(tex) {
  return `\\(${tex}\\)`
}

/* ---------------------------------------------------------------- 科目页 */

function buildCourses(ctx) {
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
        .map(
          (q) => `<li class="qrow">
        <div>
          <a class="qrow__link" href="${url(1, `questions/${q.id}.html`)}">${stemExcerpt(ctx, q)}</a>
          <div class="qrow__meta">
            <span>${esc(chapterById(ctx, q.chapter).title)}</span>
            <span>${esc(q.kind)}</span>
            ${dots(q.difficulty)}
          </div>
        </div>
        <div class="qrow__tags">${q.tags.map((t) => `<a class="tag" href="${tagHref(1, t)}">${esc(t)}</a>`).join('')}</div>
      </li>`,
        )
        .join('\n      ')}
    </ul>
    <p style="margin-top:28px"><a class="btn" href="${url(1, `questions/?course=${course.id}`)}">看全部 ${qCount} 道题</a></p>
  </div>
</section>
`
    write(ctx, `${course.id}/index.html`, page(ctx, { depth: 1, title: course.name, description: `${course.name}期中复习：${course.scope_line}。${course.scope_note}`, body, bodyClass: 'detail', navActive: course.id }))
  }
}

function chapterById(ctx, id) {
  return ctx.chapterById.get(id)
}

/* ---------------------------------------------------------------- 要点页 */

function buildNotes(ctx) {
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
<script src="${url(1, 'assets/print.js')}" defer></script>
`
    write(ctx, `notes/${note.id}.html`, page(ctx, { depth: 1, title: `${note.title} · ${note.course.name}`, description: note.lead, body, bodyClass: 'detail', navActive: note.course.id }))
  })
}

/* ---------------------------------------------------------------- 题库 */

function buildQuestionIndex(ctx) {
  const { courses, questions } = ctx

  const courseOptions = courses.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')
  const chapterOptions = courses
    .map((c) => {
      const inCh = c.chapters.filter((ch) => (ctx.qByChapter.get(ch.id) || []).length)
      if (!inCh.length) return ''
      return `<optgroup label="${esc(c.name)}">${inCh
        .map((ch) => `<option value="${ch.id}">第 ${esc(ch.no)} 章 ${esc(ch.title)}</option>`)
        .join('')}</optgroup>`
    })
    .join('')
  const tagOptions = [...ctx.tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))
    .map(([t, n]) => `<option value="${attr(t)}">${esc(t)}（${n}）</option>`)
    .join('')

  const rows = questions
    .map((q) => {
      const ch = chapterById(ctx, q.chapter)
      return `<li class="qrow" data-id="${q.id}" data-course="${q.course}" data-chapter="${q.chapter}" data-difficulty="${q.difficulty}" data-tags="${attr(q.tags.join(' '))}" data-text="${attr(q.searchText)}">
        <div>
          <a class="qrow__link" href="${url(1, `questions/${q.id}.html`)}">${stemExcerpt(ctx, q)}</a>
          <div class="qrow__meta">
            <span class="fq__id">${esc(q.id.toUpperCase())}</span>
            <span>${esc(ctx.courseById.get(q.course).short)} · ${esc(ch.title)}</span>
            <span>${esc(q.kind)}</span>
            ${dots(q.difficulty)}
          </div>
          <div class="qrow__flags">
            <button class="flag" type="button" data-flag="done" data-id="${q.id}" aria-pressed="false"><span>已做</span></button>
            <button class="flag flag--fav" type="button" data-flag="fav" data-id="${q.id}" aria-pressed="false"><span>收藏</span></button>
          </div>
        </div>
        <div class="qrow__tags">${q.tags.map((t) => `<a class="tag" href="${tagHref(1, t)}">${esc(t)}</a>`).join('')}</div>
      </li>`
    })
    .join('\n      ')

  const body = `
<div class="frame">
  <nav class="crumb" aria-label="位置">
    <a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><span>题库</span>
  </nav>
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
      <select id="f-course"><option value="">全部</option>${courseOptions}</select>
    </div>
    <div class="filters__field">
      <label for="f-chapter">章节</label>
      <select id="f-chapter"><option value="">全部</option>${chapterOptions}</select>
    </div>
    <div class="filters__field">
      <label for="f-tag">标签</label>
      <select id="f-tag"><option value="">全部</option>${tagOptions}</select>
    </div>
    <div class="filters__field">
      <label for="f-difficulty">难度</label>
      <select id="f-difficulty">
        <option value="">全部</option>
        <option value="1">1 基础</option>
        <option value="2">2 常规</option>
        <option value="3">3 综合</option>
        <option value="4">4 挑战</option>
      </select>
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

function buildQuestionPages(ctx) {
  const byCourse = new Map()
  for (const q of ctx.questions) {
    if (!byCourse.has(q.course)) byCourse.set(q.course, [])
    byCourse.get(q.course).push(q)
  }

  for (const q of ctx.questions) {
    const ch = chapterById(ctx, q.chapter)
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
  <nav class="crumb" aria-label="位置">
    <a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a>
    <span class="crumb__sep">/</span>
    <a href="${url(1, 'questions/')}">题库</a>
    <span class="crumb__sep">/</span>
    <a href="${url(1, `${course.id}/`)}">${esc(course.name)}</a>
    <span class="crumb__sep">/</span>
    <span>第 ${esc(ch.no)} 章</span>
  </nav>

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

/* ---------------------------------------------------------------- 标签页 */

function buildTagPages(ctx) {
  const entries = [...ctx.tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))

  const body = `
<div class="frame">
  <nav class="crumb" aria-label="位置"><a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><span>标签</span></nav>
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
    const rows = qs
      .map((q) => {
        const ch = chapterById(ctx, q.chapter)
        return `<li class="qrow"><div><a class="qrow__link" href="${url(1, `questions/${q.id}.html`)}">${stemExcerpt(ctx, q)}</a>
        <div class="qrow__meta"><span>${esc(ctx.courseById.get(q.course).short)} · ${esc(ch.title)}</span><span>${esc(q.kind)}</span>${dots(q.difficulty)}</div></div></li>`
      })
      .join('')
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

/* ---------------------------------------------------------------- 速查表 */

function buildCheatsheet(ctx) {
  const file = path.join(ctx.CONTENT, 'cheatsheet.md')
  if (!fs.existsSync(file)) return
  const src = fs.readFileSync(file, 'utf8')
  const headings = []
  const html = ctx.renderMarkdown(src, { errors: ctx.errors, headings })

  const body = `
<div class="frame">
  <nav class="crumb" aria-label="位置"><a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><span>速查</span></nav>
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">速查表</h1>
      <div class="pagehead__scope">
        <p>两门课最常用的一批结论：等价无穷小、麦克劳林展开、求导与中值定理、行列式与逆矩阵、线性相关性。考前十分钟扫一遍，打印出来带走也行。</p>
        <div class="pagehead__stats">
          <span><b>${headings.length}</b>组结论</span>
          <span>适合打印（A4 双栏）</span>
          <span><button class="ghost" type="button" data-print>打印</button></span>
          <span><a href="${url(1, 'questions/')}">去做题 →</a></span>
        </div>
      </div>
    </div>
  </header>

  <div class="sheet">
    <div class="sheet__body prose">
      ${html}
    </div>
  </div>
</div>
${'<script src="' + url(1, 'assets/print.js') + '" defer></script>'}`
  write(ctx, 'cheatsheet/index.html', page(ctx, { depth: 1, title: '速查表', description: '微积分 A1 与线性代数的常用结论速查：等价无穷小、麦克劳林、中值定理、行列式、逆矩阵、线性相关。', body, bodyClass: 'detail', navActive: 'cheatsheet' }))
}

/* ---------------------------------------------------------------- 真题 */

function buildPapers(ctx) {
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
  <nav class="crumb" aria-label="位置"><a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><span>真题</span></nav>
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

/* ---------------------------------------------------------------- 刷题 */

function buildPractice(ctx) {
  const courseOptions = ctx.courses.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')
  const chapterOptions = ctx.courses
    .map((c) => {
      const inCh = c.chapters.filter((ch) => (ctx.qByChapter.get(ch.id) || []).length)
      if (!inCh.length) return ''
      return `<optgroup label="${esc(c.name)}">${inCh
        .map((ch) => `<option value="${ch.id}">${esc(shortTitle(ch))}</option>`)
        .join('')}</optgroup>`
    })
    .join('')

  const body = `
<div class="frame">
  <nav class="crumb" aria-label="位置"><a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><a href="${url(1, 'questions/')}">题库</a><span class="crumb__sep">/</span><span>刷题</span></nav>
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">刷题</h1>
      <div class="pagehead__scope">
        <p>一次一道。先自己想，想不出来看提示，做完再展开解析。按科目和章节筛，或者整册随机。</p>
      </div>
    </div>
  </header>

  <div class="practice">
    <div class="practice__stage">
      <div class="practice__card" id="stage" aria-live="polite">
        <p class="hint">正在载入题库…</p>
      </div>
      <div class="practice__controls">
        <button class="btn btn--red" id="p-reveal" type="button">看解析</button>
        <button class="btn" id="p-next" type="button">下一题</button>
        <button class="btn btn--tone" id="p-open" type="button">打开题目页</button>
        <span class="practice__progress">第 <b id="p-index">0</b> / <b id="p-total">0</b> 道</span>
      </div>
    </div>
    <aside class="practice__side">
      <div class="practice__filters">
        <div class="field"><label for="p-course">科目</label><select id="p-course"><option value="">全部</option>${courseOptions}</select></div>
        <div class="field"><label for="p-chapter">章节</label><select id="p-chapter"><option value="">全部</option>${chapterOptions}</select></div>
        <div class="field"><label for="p-difficulty">难度</label>
          <select id="p-difficulty"><option value="">全部</option><option value="1">1 基础</option><option value="2">2 常规</option><option value="3">3 综合</option><option value="4">4 挑战</option></select>
        </div>
        <div class="field"><label for="p-status">状态</label>
          <select id="p-status"><option value="">全部</option><option value="undone">还没做</option><option value="fav">收藏的</option></select>
        </div>
        <div class="field"><label for="p-order">顺序</label>
          <select id="p-order"><option value="random">随机</option><option value="sequence">按题号</option></select>
        </div>
        <button class="btn btn--tone" id="p-apply" type="button">重新抽题</button>
      </div>
      <div class="callout"><b>键盘</b>空格 看解析 / 回车 下一题。<br><span data-progress-total="100">0 / 100</span> 已做 · 看解析时自动记上。</div>
    </aside>
  </div>
</div>
${'<script src="' + url(1, 'assets/practice.js') + '" defer></script>'}`
  write(ctx, 'practice/index.html', page(ctx, { depth: 1, title: '刷题', description: '随机抽题，按章节与难度筛，做完看解析。', body, bodyClass: 'detail', navActive: 'questions' }))
}

/* ---------------------------------------------------------------- 投稿 */

function buildSubmit(ctx) {
  const categories = ctx.taxonomy.categories
    .map((c) => `<option value="${c.id}">${esc(c.label)}</option>`)
    .join('')
  const chapters = ctx.courses
    .map(
      (c) =>
        `<optgroup label="${esc(c.name)}">${c.chapters
          .filter((ch) => ch.state !== 'out')
          .map((ch) => `<option value="${ch.id}">第 ${esc(ch.no)} 章 ${esc(ch.title)}</option>`)
          .join('')}</optgroup>`,
    )
    .join('')

  const body = `
<div class="frame">
  <nav class="crumb" aria-label="位置"><a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><span>投稿</span></nav>
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">投稿一道题</h1>
      <div class="pagehead__scope">
        <p>左边写，右边实时预览。写完可以一键开一个 GitHub issue，或者把 .md 文件下载下来交给管理员。合并之后它就是一个独立的题目文件。</p>
        <div class="pagehead__stats">
          <span>格式 Markdown + \\( \\)</span>
          <span>每题一个文件</span>
          <span>标签与难度必填</span>
        </div>
      </div>
    </div>
  </header>

  <div class="submit">
    <form class="submit__form" id="submit-form" data-repo="${attr(ctx.config.repo)}" onsubmit="return false">
      <div class="submit__row">
        <div class="field">
          <label for="s-course">课程</label>
          <select class="select" id="s-course">
            <option value="va1">微积分 A1</option>
            <option value="la">线性代数</option>
          </select>
        </div>
        <div class="field">
          <label for="s-chapter">章节</label>
          <select class="select" id="s-chapter">${chapters}</select>
        </div>
      </div>
      <div class="submit__row">
        <div class="field">
          <label for="s-difficulty">难度</label>
          <select class="select" id="s-difficulty">
            <option value="1">1 基础</option>
            <option value="2" selected>2 常规</option>
            <option value="3">3 综合</option>
            <option value="4">4 挑战</option>
          </select>
        </div>
        <div class="field">
          <label for="s-kind">题型</label>
          <select class="select" id="s-kind">
            <option>计算题</option><option>证明题</option><option>概念题</option><option>综合题</option>
          </select>
        </div>
      </div>
      <div class="submit__row">
        <div class="field">
          <label for="s-category">大分类</label>
          <select class="select" id="s-category">${categories}</select>
        </div>
        <div class="field">
          <label for="s-origin">署名</label>
          <input class="input" id="s-origin" type="text" placeholder="可留空，默认佚名">
        </div>
      </div>
      <div class="field">
        <label for="s-tags">标签</label>
        <input class="input" id="s-tags" type="text" placeholder="用逗号分开，比如：泰勒公式, 极限计算" list="tag-suggestions">
        <datalist id="tag-suggestions">
          ${ctx.taxonomy.tags.map((t) => `<option value="${attr(t)}"></option>`).join('')}
        </datalist>
        <p class="hint">一到四个。管理员可以在 taxonomy.yml 里加新标签。</p>
      </div>

      <div class="field">
        <label for="s-stem">题面</label>
        <div class="submit__tools" aria-label="插入公式">
          <button type="button" data-wrap="inline">行内公式</button>
          <button type="button" data-wrap="display">独立公式</button>
          <button type="button" data-sym="\\frac{}{}">分式</button>
          <button type="button" data-sym="\\lim_{x\\to 0}">极限</button>
          <button type="button" data-sym="\\int">积分</button>
          <button type="button" data-sym="\\sum_{k=1}^{n}">求和</button>
          <button type="button" data-sym="\\begin{pmatrix} & \\\\ & \\end{pmatrix}">矩阵</button>
          <button type="button" data-sym="\\sqrt{}">根号</button>
        </div>
        <textarea class="textarea textarea--code" id="s-stem" rows="6" placeholder="设 \\(f(x)=\\dfrac{1}{1+x}\\)，求 \\(f^{(n)}(0)\\)。"></textarea>
      </div>

      <div class="field">
        <label for="s-hint">提示（可选）</label>
        <textarea class="textarea textarea--code" id="s-hint" rows="2" placeholder="先算前几阶导数，找规律。"></textarea>
      </div>

      <div class="field">
        <label for="s-solution">解析</label>
        <textarea class="textarea textarea--code" id="s-solution" rows="8" placeholder="写出为什么这样想：关键的一步、用到的条件、容易漏掉的情况。"></textarea>
      </div>

      <div class="submit__row">
        <div class="field">
          <label for="s-answer">答案（可选，填空/计算题建议写）</label>
          <input class="input" id="s-answer" type="text" placeholder="\\((-1)^{n}\\,n!\\)">
        </div>
        <div class="field">
          <label for="s-mistakes">常见错误（可选）</label>
          <input class="input" id="s-mistakes" type="text" placeholder="两三行 Markdown 也行">
        </div>
      </div>

      <div class="submit__actions">
        <button class="btn btn--red" id="s-issue" type="button">在 GitHub 开 issue</button>
        <button class="btn" id="s-download" type="button">下载 .md 文件</button>
        <button class="btn btn--tone" id="s-copy" type="button">复制 Markdown</button>
        <button class="btn btn--tone" id="s-reset" type="button">清空</button>
      </div>
      <p class="submit__status" id="s-status" aria-live="polite"></p>
    </form>

    <aside class="submit__preview">
      <h2><span>预览</span><span id="p-file">content/questions/…</span></h2>
      <div class="prose" id="preview">
        <p class="hint">左边写题面，这里会同步显示排版后的样子。公式用 \\( \\) 写行内，\\[ \\] 写独立成行。</p>
      </div>
    </aside>
  </div>

  <section class="section--tight">
    <div class="rule-head"><h2>投稿之后</h2><p>一道题从你写下来到出现在题库里，要过三步。</p></div>
    <div class="steps">
      <article class="step step--1">
        <h3 class="step__name">提</h3>
        <div class="step__plate"><pre class="step__art"><code>1. 开 issue
   标题：[题目投稿] …
   标签：question-submission
   正文：就是预览里那整段</code></pre></div>
        <p class="step__text">issue 里带着完整的 frontmatter 和文件名建议。issue 太长放不下时，下载 .md 附在评论里。</p></article>
      <article class="step step--2">
        <h3 class="step__name">审</h3>
        <div class="step__plate"><pre class="step__art"><code>2. 管理员审
   看数学对不对
   看标签与难度
   看有没有重复
   必要时在 issue 里讨论</code></pre></div>
        <p class="step__text">管理员会把 issue 转成一个文件（scripts/issue-to-question.mjs 可以从 issue 正文直接生成），提交 PR。</p></article>
      <article class="step step--3">
        <h3 class="step__name">归档</h3>
        <div class="step__plate"><pre class="step__art"><code>3. 合并
   git merge
   npm run build
   Pages 自动更新

   新题出现在：题库 / 标签页 / 章节</code></pre></div>
        <p class="step__text">合并后重新构建，题目进入题库、标签页与对应章节；范围统计和首页数字一起更新。</p></article>
    </div>
  </section>
</div>
${'<script src="' + url(1, 'assets/vendor/markdown-it.min.js') + '"></script>'}
${'<script src="' + url(1, 'assets/vendor/katex.min.js') + '"></script>'}
${'<script src="' + url(1, 'assets/submit.js') + '" defer></script>'}`
  write(ctx, 'submit/index.html', page(ctx, { depth: 1, title: '投稿', description: '写一道题，实时预览，一键开 issue 或下载 Markdown。', body, bodyClass: 'detail' }))
}

/* ---------------------------------------------------------------- 关于 */

function buildAbout(ctx) {
  const credits = loadCredits()
  const rows = credits
    .map(
      (c) =>
        `<tr><td>${esc(c.file)}</td><td>${esc(c.credit)}</td><td><a href="${attr(c.page)}" target="_blank" rel="noopener noreferrer">来源</a></td></tr>`,
    )
    .join('')

  const body = `
<div class="frame">
  <nav class="crumb" aria-label="位置"><a href="${url(1, '')}">${esc(ctx.config.wordmark)}</a><span class="crumb__sep">/</span><span>关于</span></nav>
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">关于这本册子</h1>
      <div class="pagehead__scope">
        <p>${esc(ctx.config.description)}</p>
      </div>
    </div>
  </header>

  <div class="article__main prose" style="max-width:42em;padding-bottom:var(--section-y)">
    <h2>范围</h2>
    <p><b>微积分 A1</b>：第 1 章到第 4.3 节「泰勒公式」（含）。也就是实数系与数列极限、函数极限与连续、导数与微分、微分中值定理与洛必达法则、泰勒公式。4.4 节「函数的增减性与极值问题」及之后不在期中范围。</p>
    <p><b>线性代数</b>：第 1 章「线性方程组与行列式」、第 2 章「矩阵」、第 3 章「n 维向量空间」中向量组的秩之前（n 维向量、线性表示、线性相关与线性无关）。向量组的秩、矩阵的秩、方程组解的结构都不在期中范围。</p>
    <p>范围按课本章节整理，以任课教师的正式通知为准。章节与考纲状态写在 <code>content/courses.yml</code> 里，改一行就能改整站的判定。</p>

    <h2>内容怎么组织的</h2>
    <p>这个站点不是手写 HTML。所有中文内容都是仓库里的 Markdown 文件：一题一个文件放在 <code>content/questions/</code>，一章要点一个文件放在 <code>content/notes/</code>，构建脚本读它们，生成题库、标签页、章节索引和这一页。所以「投稿 → 合并 → 上线」是一条完整的路。</p>
    <p>题目自编，格式与难度参考历年期中卷；历年真题只做考点索引，不整题收录。图片取自公有领域与开放授权的藏品，出处列在下面。</p>

    <h2>技术</h2>
    <p>纯静态站点，构建脚本是一个 Node 脚本，公式用 KaTeX 在构建时渲染成 HTML，运行时不需要 JavaScript 也能读题。部署在 GitHub Pages 上，所有链接都是相对路径，放在任何子路径下都能用。</p>

    <h2>许可</h2>
    <p>本站文字与题目以 CC BY-SA 4.0 发布，代码以 MIT 发布。图片版权属于各自的收藏机构，见下表。</p>

    <h2>常见问题</h2>
    <p><b>期中范围以哪个为准？</b>以任课教师的正式通知为准。本站按课本目录整理：微积分 A1 到 4.3 节「泰勒公式」（含），线性代数到第三章向量组的秩之前。</p>
    <p><b>这 100 道题是哪来的？</b>全部自编，格式与难度参考 2019–2025 历年期中卷与 2026 期中样卷；不整题抄录真题，历年卷只在「真题」页做考点索引。</p>
    <p><b>为什么有些章节是灰的？</b>那是期中之后才考的内容，等期末那一版会补上颜色。</p>
    <p><b>进度存在哪里？</b>「已做」「收藏」只存在你自己的浏览器（localStorage），不上传，换设备或清缓存就没了。</p>
    <p><b>投稿要写什么格式？</b>Markdown，公式用 \( \) 和 \[ \]。投稿页有实时预览，会顺手生成 frontmatter 和文件名。</p>
    <p><b>题目合并之后会怎样？</b>它会变成 content/questions/ 下的一个文件，出现在题库、对应标签页和所属章节里。</p>
    <p><b>能打印吗？</b>能。速查表、每篇要点、每道题都做了打印样式。</p>

    <h2>图片来源</h2>
    <table>
      <thead><tr><th>文件</th><th>来源与授权</th><th>页面</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`
  write(ctx, 'about/index.html', page(ctx, { depth: 1, title: '关于', description: '范围说明、内容组织方式、许可与图片来源。', body, bodyClass: 'detail' }))
}

function loadCredits() {
  const p = path.join(process.cwd(), 'src/assets/photos/credits.json')
  if (!fs.existsSync(p)) return []
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'))
    const list = Array.isArray(data) ? data : data.credits || []
    return list.map((c) => ({
      file: path.basename(c.saved || c.file || c.path || c.name || ''),
      credit: c.credit || '',
      page: c.page || c.source || '',
    }))
  } catch {
    return []
  }
}

/* ---------------------------------------------------------------- 404 */

function buildNotFound(ctx) {
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

function buildData(ctx) {
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
    chapterTitle: chapterById(ctx, q.chapter).title,
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

function buildExtras(ctx) {
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

/* ---------------------------------------------------------------- 静态资源 */

function copyStatic(ctx) {
  const pairs = [
    ['src/assets/photos', 'assets/photos'],
    ['src/assets/vendor', 'assets/vendor'],
  ]
  for (const [from, to] of pairs) {
    const src = path.join(ctx.ROOT, from)
    if (!fs.existsSync(src)) continue
    copyDir(src, path.join(ctx.OUT, to))
  }
  // 字体
  const fonts = path.join(ctx.ROOT, 'src/assets/fonts')
  if (fs.existsSync(fonts)) copyDir(fonts, path.join(ctx.OUT, 'assets/fonts'))
  // KaTeX
  const katexDist = path.join(ctx.ROOT, 'node_modules/katex/dist')
  if (fs.existsSync(katexDist)) {
    const out = path.join(ctx.OUT, 'assets/katex')
    fs.mkdirSync(out, { recursive: true })
    fs.copyFileSync(path.join(katexDist, 'katex.min.css'), path.join(out, 'katex.min.css'))
    copyDir(path.join(katexDist, 'fonts'), path.join(out, 'fonts'))
  }
  // CSS 合并
  const styles = ['tokens', 'base', 'home', 'pages', 'practical', 'sheet', 'export', 'utility']
    .map((n) => path.join(ctx.ROOT, 'src/styles', `${n}.css`))
    .filter((p) => fs.existsSync(p))
    .map((p) => fs.readFileSync(p, 'utf8'))
  const fontsCssPath = path.join(ctx.ROOT, 'src/styles/fonts.css')
  const fontsCss = fs.existsSync(fontsCssPath) ? fs.readFileSync(fontsCssPath, 'utf8') : ''
  const css = [fontsCss, ...styles].join('\n')
  fs.mkdirSync(path.join(ctx.OUT, 'assets'), { recursive: true })
  fs.writeFileSync(path.join(ctx.OUT, 'assets/site.css'), css, 'utf8')
  // 打印版样式（单独一份，不并进 site.css）
  const sheetCss = path.join(ctx.ROOT, 'src/styles/print-sheet.css')
  if (fs.existsSync(sheetCss)) fs.copyFileSync(sheetCss, path.join(ctx.OUT, 'assets/print-sheet.css'))
  // JS
  for (const name of ['progress.js', 'site.js', 'submit.js', 'practice.js', 'print.js', 'export.js', 'export-print.js']) {
    const p = path.join(ctx.ROOT, 'src/assets', name)
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(ctx.OUT, 'assets', name))
  }
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dst, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}