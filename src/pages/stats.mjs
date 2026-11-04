import { page, write, url, esc, attr, crumb } from '../lib/site.mjs'

/* ==========================================================================
   进度：按章节列已做 / 收藏，谁没做过一目了然。数据只在浏览器里。
   ========================================================================== */

export function buildStats(ctx) {
  const total = ctx.stats.questions

  const courseBlocks = ctx.courses
    .map((c) => {
      const chapters = c.chapters.filter((ch) => (ctx.qByChapter.get(ch.id) || []).length)
      if (!chapters.length) return ''
      const courseIds = chapters.flatMap((ch) => (ctx.qByChapter.get(ch.id) || []).map((q) => q.id))
      const rows = chapters
        .map((ch) => {
          const ids = (ctx.qByChapter.get(ch.id) || []).map((q) => q.id)
          const note = ctx.notesByChapter.get(ch.id)
          return `<tr data-chapter="${ch.id}">
            <td class="st__chapter">${ch.no ? `<em>${esc(ch.no)}</em>` : ''}${esc(ch.title)}</td>
            <td class="st__num">${ids.length}</td>
            <td class="st__num"><span data-progress-ids="${attr(ids.join(','))}"><b data-progress-here>0</b></span></td>
            <td class="st__num"><span data-fav-ids="${attr(ids.join(','))}"><b data-progress-count>0</b></span></td>
            <td class="st__bar"><span class="st__bar-track" data-progress-bar="${attr(ids.join(','))}"><i></i></span></td>
            <td class="st__go">
              <a href="${url(1, `questions/?chapter=${ch.id}`)}">题目</a>
              ${note ? `<a href="${url(1, `notes/${ch.id}.html`)}">要点</a>` : ''}
              <a href="${url(1, `export/?chapter=${ch.id}`)}">导出</a>
            </td>
          </tr>`
        })
        .join('')

      return `<section class="st-course">
        <header class="st-course__head">
          <h2><a href="${url(1, `${c.id}/`)}">${esc(c.name)}</a></h2>
          <p class="st-course__sum" data-progress-ids="${attr(courseIds.join(','))}">
            已做 <b data-progress-here>0</b> / ${courseIds.length}
            <span class="st__bar st__bar--wide"><span class="st__bar-track" data-progress-bar="${attr(courseIds.join(','))}"><i></i></span></span>
          </p>
        </header>
        <table class="st-table">
          <thead><tr><th>章节</th><th>题</th><th>已做</th><th>收藏</th><th>进度</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`
    })
    .join('')

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '进度' }])}

  <header class="pagehead pagehead--wide">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">进度</h1>
      <div class="pagehead__scope st-head">
        <div class="st-head__text">
          <p>你标过「已做」「收藏」的题会汇总在这里，按章节排。这些记录只存在这台设备的浏览器里，不上传，清缓存就没了。</p>
          <div class="pagehead__stats">
            <span>共 ${total} 道题</span>
            <span data-progress-ids="${attr(ctx.questions.map((q) => q.id).join(','))}">已做 <b data-progress-here>0</b> 道</span>
            <span>收藏 <b data-progress-count>0</b></span>
          </div>
        </div>
        <div class="st-head__actions">
          <a class="btn btn--red" href="${url(1, 'practice/')}">继续刷题</a>
          <a class="btn btn--tone" href="${url(1, 'practice/?random=1')}">随机抽一道</a>
          <a class="btn btn--tone" href="${url(1, 'questions/?status=undone')}">只看没做的</a>
          <a class="btn btn--tone" href="${url(1, 'questions/?status=fav')}">只看收藏的</a>
        </div>
      </div>
    </div>
  </header>

  <section class="section--tight">
    ${courseBlocks}
  </section>

  <section class="section--tight">
    <div class="rule-head">
      <h2>难度的分布</h2>
      <p>按五档难度看题库：第 5 档是硬核题，需要两跳以上。</p>
    </div>
    <ul class="st-diff">
      ${[1, 2, 3, 4, 5]
        .map((d) => {
          const n = ctx.questions.filter((q) => q.difficulty === d).length
          const label = { 1: '基础', 2: '常规', 3: '综合', 4: '挑战', 5: '硬核' }[d]
          return `<li>
            <a href="${url(1, `questions/?difficulty=${d}`)}">
              <span class="st-diff__label">${d} ${label}</span>
              <span class="st-diff__num">${n}</span>
              <span class="st-diff__track"><i style="width:${Math.round((n / ctx.stats.questions) * 100)}%"></i></span>
            </a>
          </li>`
        })
        .join('')}
    </ul>
  </section>
</div>`

  write(
    ctx,
    'stats/index.html',
    page(ctx, {
      depth: 1,
      title: '进度',
      description: '按章节看已做、收藏与进度条；记录只存在本地浏览器。',
      body,
      bodyClass: 'detail',
      navActive: '',
    }),
  )
}
