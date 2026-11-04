import {
  page,
  write,
  url,
  esc,
  attr,
  stateLabel,
  dots,
  stemExcerpt,
  shortTitle,
} from '../lib/site.mjs'

/* ==========================================================================
   首页：先给能用的东西（搜题、进度、范围表、题），装饰只留一件（两个圆）。
   ========================================================================== */

const FEATURED = ['va1-001', 'va1-030', 'va1-042', 'la-001', 'la-014', 'la-050']

export function buildHome(ctx) {
  const { config, courses, stats } = ctx
  const featured = FEATURED.map((id) => ctx.questions.find((q) => q.id === id)).filter(Boolean)

  /* 范围表：每章一行，带范围状态、题数、已做进度、要点入口 */
  const emptyCourses = courses.filter((c) => !(ctx.qByCourse.get(c.id) || []).length)

  const rangeCourses = courses
    .filter((c) => (ctx.qByCourse.get(c.id) || []).length)
    .map((c) => {
      const inScope = c.chapters.filter((ch) => ch.state !== 'out')
      const rows = c.chapters
        .map((ch) => {
          const note = ctx.notesByChapter.get(ch.id)
          const ids = (ctx.qByChapter.get(ch.id) || []).map((q) => q.id)
          const count = ids.length
          return `<tr class="${ch.state === 'out' ? 'is-out' : ''}" data-chapter="${ch.id}" data-states="${attr(JSON.stringify(ch.terms || {}))}">
            <td class="range__no">${esc(ch.no)}</td>
            <td class="range__title">
              <a href="${url(0, `${c.id}/#ch-${ch.id}`)}">${esc(ch.title)}</a>
              <span class="range__secs">${ch.sections
                .filter((s) => s.state !== 'out')
                .map((s) => esc(s.no))
                .join(' ')}</span>
            </td>
            <td class="range__state"><span class="chip chip--${ch.state}" data-chip>${stateLabel(ch.state)}</span></td>
            <td class="range__count">${
              count ? `<a href="${url(0, `questions/?chapter=${ch.id}`)}">${count}</a>` : '—'
            }</td>
            <td class="range__prog">${
              count
                ? `<span data-progress-ids="${attr(ids.join(','))}"><b data-progress-here>0</b>/${count}</span>`
                : '—'
            }</td>
            <td class="range__note">${note ? `<a href="${url(0, `notes/${ch.id}.html`)}">读</a>` : '—'}</td>
          </tr>`
        })
        .join('')

      return `<section class="range-course" data-course-terms="${(c.terms || []).join(' ')}">
        <header class="range-course__head">
          <h3><a href="${url(0, `${c.id}/`)}">${esc(c.name)}</a></h3>
          <p>${esc(c.scope_line)}</p>
          <p class="range-course__links">
            <a href="${url(0, `questions/?course=${c.id}`)}">${ctx.qByCourse.get(c.id)?.length || 0} 道题</a>
            <a href="${url(0, `${c.id}/`)}">完整考纲</a>
          </p>
        </header>
        <table class="range">
          <thead><tr><th>章</th><th>内容</th><th>范围</th><th>题</th><th>已做</th><th>要点</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="range-course__foot">在范围内 ${inScope.length} 章 · 期中之后 ${c.chapters.length - inScope.length} 章（灰）</p>
      </section>`
    })
    .join('')

  const featuredRows = featured
    .map((q) => {
      const ch = ctx.chapterById.get(q.chapter)
      return `<li class="fq">
        <a class="fq__link" href="${url(0, `questions/${q.id}.html`)}">${stemExcerpt(ctx, q)}</a>
        <div class="fq__meta">
          <span class="fq__id">${esc(q.id.toUpperCase())}</span>
          <span>${esc(ctx.courseById.get(q.course).short)} · ${esc(shortTitle(ch))}</span>
          <span>${esc(q.kind)}</span>
          ${dots(q.difficulty)}
        </div>
      </li>`
    })
    .join('')

  const body = `
<section class="hero hero--compact">
  <div class="hero__discs" aria-hidden="true">
    <i class="disc disc--red"></i>
    <i class="disc disc--indigo"></i>
  </div>
  <div class="frame hero__inner">
    <div class="hero__copy">
      <h1 class="hero__title">要考的范围<br>和题都在这里</h1>
      <p class="hero__lead">课程范围、要点和题都在这里。<b data-term-label>期中</b> · ${stats.questions} 道题 · ${stats.notes} 篇要点，右上角可换轮次。</p>
      <form class="search" action="${url(0, 'questions/')}" method="get" role="search">
        <label class="sr-only" for="q">搜题</label>
        <input class="search__input" id="q" name="q" type="search" placeholder="搜题：题干、标签、出处" autocomplete="off">
        <button class="btn btn--red search__btn" type="submit">搜题</button>
      </form>
      <p class="hero__note">已做 <span data-progress-total="${stats.questions}">0 / ${stats.questions}</span> · <a href="${url(0, 'stats/')}">看进度</a> · 按 <span class="kbd">/</span> 在题库里搜</p>
    </div>
  </div>
</section>

<section class="frame section--tight">
  <ul class="quick">
    <li><a href="${url(0, 'questions/')}"><b>题库</b><span>${stats.questions} 道，可筛可搜</span></a></li>
    <li><a href="${url(0, 'practice/')}"><b>刷题</b><span>一次一道，先想再看</span></a></li>
    <li><a href="${url(0, 'practice/?random=1')}"><b>随机一题</b><span>抽一道就开工</span></a></li>
    <li><a href="${url(0, 'cheatsheet/')}"><b>速查</b><span>公式与结论，可打印</span></a></li>
    <li><a href="${url(0, 'questions/?difficulty=5')}"><b>硬核</b><span>两跳以上，压轴档</span></a></li>
    <li><a href="${url(0, 'export/')}"><b>导出</b><span>挑题生成 A4 卷子</span></a></li>
  </ul>
</section>

<section class="frame section--tight" id="scope">
  <div class="rule-head">
    <h2>范围</h2>
    <p>按课本目录排。灰的是不在当前轮次范围的章节；「已做」跟着你的进度变。</p>
  </div>
  <div class="checker checker--inline">
    <label class="sr-only" for="scope-input">查一个知识点考不考</label>
    <input class="checker__input" id="scope-input" type="search" placeholder="查一个知识点考不考：极值 / 泰勒 / 标准形 / 一致连续" autocomplete="off" spellcheck="false">
    <button class="btn btn--tone" id="scope-clear" type="button">清空</button>
  </div>
  <ul class="checker__chips" aria-label="试试这些">
    ${['泰勒公式', '极值', '向量组的秩', '行列式', '一致连续']
      .map((k) => `<li><button type="button" data-try="${attr(k)}">${esc(k)}</button></li>`)
      .join('')}
  </ul>
  <p class="checker__verdict" id="scope-verdict" aria-live="polite">输入一个词，下面这张表会告诉你它落在哪一章、考不考。</p>
  <div class="ranges">${rangeCourses}</div>
  ${courses
    .filter((course) => course.id !== 'other')
    .filter((course) => {
      const n = (ctx.qByCourse.get(course.id) || []).length
      return n > 0 || (course.terms || []).length < 2
    })
    .filter((course) => (course.terms || []).length < 2 || !(ctx.qByCourse.get(course.id) || []).length)
    .map((course) => {
      const only = (course.terms || []).length === 1 ? (course.terms[0] === 'final' ? '只有期末' : '只有期中') : ''
      return `<p class="ranges__other"><b>${esc(course.name)}</b>${only ? `<span>${only}</span>` : ''}<a href="${url(0, `${course.id}/`)}">看考纲</a></p>`
    })
    .join('')}
  ${emptyCourses
    .map(
      (c) =>
        `<p class="ranges__empty">${esc(c.name)}这一类还没有题：<a href="${url(0, 'submit/')}">投一道</a>，审核通过后会自动进这里。</p>`,
    )
    .join('')}
</section>

<section class="frame section--tight">
  <div class="rule-head">
    <h2>先做这几道</h2>
    <p>每章挑一道，常规到综合都有，都是卷子上常见的题型。</p>
  </div>
  <ul class="fqlist">${featuredRows}</ul>
  <p class="more">
    <a class="btn btn--tone" href="${url(0, 'questions/')}">看全部 ${stats.questions} 道题</a>
    <a href="${url(0, 'practice/?random=1')}">随机抽一道 →</a>
  </p>
</section>

<section class="frame section--tight">
  <div class="rule-head">
    <h2>速查与投稿</h2>
    <p>考前十分钟能扫完的公式页，和一道题从写下来到进题库的流程。</p>
  </div>
  <div class="twocol">
    <div class="panel">
      <h3>速查表</h3>
      <ul class="ticks">
        <li>等价无穷小 12 条、麦克劳林展开 6 条</li>
        <li>求导公式、中值定理三件套、洛必达的失效例</li>
        <li>行列式七条性质、伴随与逆、初等变换、线性相关判定</li>
      </ul>
      <p><a class="btn" href="${url(0, 'cheatsheet/')}">打开速查表</a></p>
    </div>
    <div class="panel">
      <h3>投稿一道题</h3>
      <ol class="ticks">
        <li>写成 Markdown，公式用 \\( \\) 与 \\[ \\]，投稿页有实时预览</li>
        <li>一键开 GitHub issue，或下载 <code>.md</code> 交给管理员</li>
        <li>合并后自动进题库、标签页和对应章节</li>
      </ol>
      <p><a class="btn btn--tone" href="${url(0, 'submit/')}">去投稿</a></p>
    </div>
  </div>
</section>

<section class="frame section--tight">
  <div class="materials materials--slim materials--mini">
    <div class="materials__head">
      <h2>材料</h2>
      <p>考的东西都有出处。四张纸，出处与许可在关于页。</p>
    </div>
    <div class="materials__strip">
      <figure class="materials__item">
        <img src="${url(0, 'assets/photos/arithmetic.jpg')}" width="900" height="1220" alt="十八世纪的一页算术手稿" loading="lazy" decoding="async">
        <figcaption>十八世纪算术手稿</figcaption>
      </figure>
      <figure class="materials__item">
        <img src="${url(0, 'assets/photos/euler.jpg')}" width="1000" height="1320" alt="欧拉《无穷小分析引论》1748 年初版扉页" loading="lazy" decoding="async">
        <figcaption>欧拉《无穷小分析引论》1748</figcaption>
      </figure>
      <figure class="materials__item">
        <img src="${url(0, 'assets/photos/slide-rule.jpg')}" width="1400" height="840" alt="一把木制计算尺" loading="lazy" decoding="async">
        <figcaption>计算尺</figcaption>
      </figure>
      <figure class="materials__item">
        <img src="${url(0, 'assets/photos/chalkboard.jpg')}" width="1400" height="788" alt="黑板上写着绝对值不等式的例子" loading="lazy" decoding="async">
        <figcaption>黑板上的绝对值例子</figcaption>
      </figure>
    </div>
  </div>
  <p class="closing">
    <a href="${url(0, 'about/')}">关于这本册子：范围说明、内容怎么组织、许可与图片来源 →</a>
  </p>
</section>
`

  write(
    ctx,
    'index.html',
    page(ctx, {
      depth: 0,
      title: '',
      description: config.description,
      body,
      navActive: '',
    }),
  )
}
