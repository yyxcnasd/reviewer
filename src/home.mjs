import { page, write, url, esc, attr, stateLabel, dots, tagHref, stemExcerpt } from './layout.mjs'

/* ==========================================================================
   首页：先给能用的东西（搜题、入口、范围表、题），再给设计。
   ========================================================================== */

const SHORT = {
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

const FEATURED = ['va1-001', 'va1-030', 'va1-042', 'la-001', 'la-014', 'la-050']

export function buildHome(ctx) {
  const { config, courses, stats } = ctx

  const featured = FEATURED.map((id) => ctx.questions.find((q) => q.id === id)).filter(Boolean)

  const rangeCourses = courses
    .map((c) => {
      const inScope = c.chapters.filter((ch) => ch.state !== 'out')
      const rows = c.chapters
        .map((ch) => {
          const note = ctx.notesByChapter.get(ch.id)
          const count = ctx.qByChapter.get(ch.id)?.length || 0
          return `<tr class="${ch.state === 'out' ? 'is-out' : ''}" data-chapter="${ch.id}">
            <td class="range__no">${esc(ch.no)}</td>
            <td class="range__title">
              <a href="${url(0, `${c.id}/#ch-${ch.id}`)}">${esc(ch.title)}</a>
              <span class="range__secs">${ch.sections
                .filter((s) => s.state !== 'out')
                .map((s) => esc(s.no))
                .join(' ')}</span>
            </td>
            <td class="range__state"><span class="chip chip--${ch.state}">${stateLabel(ch.state)}</span></td>
            <td class="range__count">${
              count ? `<a href="${url(0, `questions/?chapter=${ch.id}`)}">${count}</a>` : '—'
            }</td>
            <td class="range__note">${note ? `<a href="${url(0, `notes/${ch.id}.html`)}">读</a>` : '—'}</td>
          </tr>`
        })
        .join('')

      return `<section class="range-course">
        <header class="range-course__head">
          <h3><a href="${url(0, `${c.id}/`)}">${esc(c.name)}</a></h3>
          <p>${esc(c.scope_line)}</p>
          <p class="range-course__links">
            <a href="${url(0, `questions/?course=${c.id}`)}">${ctx.qByCourse.get(c.id)?.length || 0} 道题</a>
            <a href="${url(0, `${c.id}/`)}">完整考纲</a>
          </p>
        </header>
        <table class="range">
          <thead><tr><th>章</th><th>内容</th><th>范围</th><th>题</th><th>要点</th></tr></thead>
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
          <span>${esc(ctx.courseById.get(q.course).short)} · ${esc(SHORT[ch.id] || ch.title)}</span>
          <span>${esc(q.kind)}</span>
          ${dots(q.difficulty)}
        </div>
      </li>`
    })
    .join('')

  const body = `
<section class="hero hero--compact">
  <div class="hero__discs">
    <i class="disc disc--red" aria-hidden="true"></i>
    <i class="disc disc--indigo" aria-hidden="true"></i>
  </div>
  <div class="frame hero__inner">
    <div class="hero__copy">
      <h1 class="hero__title">期中要考的<br>都在这里</h1>
      <p class="hero__lead">期中复习站：微积分 A1 考到 4.3 节泰勒公式，线性代数考到向量组的秩之前。${stats.questions} 道题带解析，${stats.notes} 篇要点，${ctx.papers.length} 套真题索引。</p>
      <form class="search" action="${url(0, 'questions/')}" method="get" role="search">
        <label class="sr-only" for="q">搜题</label>
        <input class="search__input" id="q" name="q" type="search" placeholder="搜题：题干、标签、出处" autocomplete="off">
        <button class="btn btn--red search__btn" type="submit">搜题</button>
      </form>
      <p class="hero__note">已做 <span data-progress-total="${stats.questions}">0 / ${stats.questions}</span> · 题库 ${stats.questions} 道，全部带解析 · 按 <span class="kbd">/</span> 在题库里搜</p>
    </div>
  </div>
</section>

<section class="frame section--tight">
  <ul class="quick">
    <li><a href="${url(0, 'questions/')}"><b>题库</b><span>${stats.questions} 道，按章节/标签/难度筛</span></a></li>
    <li><a href="${url(0, 'practice/')}"><b>刷题</b><span>一次一道，先想再看解析</span></a></li>
    <li><a href="${url(0, 'cheatsheet/')}"><b>速查</b><span>公式与结论，一页过完</span></a></li>
    <li><a href="${url(0, 'papers/')}"><b>真题</b><span>${ctx.papers.length} 套卷的题型与考点</span></a></li>
    <li><a href="${url(0, 'export/')}"><b>导出</b><span>挑题生成 A4 卷子，可打印</span></a></li>
  </ul>
</section>

<section class="frame section--tight" id="scope">
  <div class="rule-head">
    <h2>范围</h2>
    <p>按课本目录排。灰掉的是期中之后才考的章节，等期末再补。</p>
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
</section>

<section class="frame section--tight">
  <div class="rule-head">
    <h2>先做这几道</h2>
    <p>每章一道，难度从常规到综合，都是卷面上最常见的形状。</p>
  </div>
  <ul class="fqlist">${featuredRows}</ul>
  <p class="more"><a class="btn btn--tone" href="${url(0, 'questions/')}">看全部 ${stats.questions} 道题</a></p>
</section>

<section class="section--tight field-paper2">
  <div class="frame">
    <div class="rule-head">
      <h2>三条必背</h2>
      <p>考场上真的会用到的三条。完整版在速查页，可以打印。</p>
    </div>
    <div class="threeup">
      <article class="three">
        <h3>泰勒公式</h3>
        ${ctx.renderMarkdown(
          `**若 \\(f\\) 在 \\(x_0\\) 处 \\(n\\) 阶可导**：\n\n\\[f(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+o\\big((x-x_0)^n\\big)\\]\n\n皮亚诺余项用来算极限；换成拉格朗日余项 \\(\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1}\\) 才能估误差、证不等式。`,
          { errors: ctx.errors },
        )}
      </article>
      <article class="three">
        <h3>拉格朗日中值定理</h3>
        ${ctx.renderMarkdown(
          `\\(f\\) 在 \\([a,b]\\) 连续、\\((a,b)\\) 内可导，则存在 \\(\\xi\\in(a,b)\\)：\n\n\\[f(b)-f(a)=f'(\\xi)(b-a)\\]\n\n条件缺一不可。见到 \\(f'\\) 与 \\(f\\) 同时出现，试乘 \\(e^{\\lambda x}\\) 造辅助函数。`,
          { errors: ctx.errors },
        )}
      </article>
      <article class="three">
        <h3>线性相关</h3>
        ${ctx.renderMarkdown(
          `\\(\\alpha_1,\\dots,\\alpha_s\\) **线性相关**，就是存在不全为零的 \\(k_i\\) 使 \\(\\sum k_i\\alpha_i=0\\)。\n\n等价说法：某个向量可由其余表示；向量个数大于维数；含零向量。换成方程组，就是齐次方程有非零解。`,
          { errors: ctx.errors },
        )}
      </article>
    </div>
    <p class="more"><a href="${url(0, 'cheatsheet/')}">打开速查表 →</a></p>
  </div>
</section>

<section class="frame section--tight">
  <div class="rule-head">
    <h2>投稿</h2>
    <p>你出的题也可以在这里。写完是 issue，管理员合并后就变成题库里的一个文件。</p>
  </div>
  <ol class="flow">
    <li><b>写</b><span>Markdown + 公式，题面、提示、解析分开写</span></li>
    <li><b>提</b><span>投稿页实时预览，一键开 GitHub issue 或下载 .md</span></li>
    <li><b>归档</b><span>合并后自动进题库、标签页和对应章节</span></li>
  </ol>
  <p class="more"><a class="btn" href="${url(0, 'submit/')}">去投稿</a></p>
</section>

<section class="frame section--tight">
  <div class="materials materials--slim">
    <div class="materials__head">
      <h2>材料</h2>
      <p>考的东西都有出处。四张纸，配着这个站点的调子。</p>
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
  <p class="more"><a href="${url(0, 'about/')}">出处与许可、常见问题 →</a></p>
</section>

<a class="band band--slim" href="${url(0, 'questions/')}">
  <span class="band__word">开始</span>
  <span class="band__note">${stats.questions} 道题，从哪一道开始都行。先自己做，再看解析。</span>
  <svg class="band__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 18 18 6M18 6H8M18 6v10"/></svg>
</a>
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
