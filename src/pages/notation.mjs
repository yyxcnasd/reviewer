import { page, write, url, esc, attr, crumb } from '../lib/site.mjs'
import { SHORTHANDS } from '../shorthands.mjs'

/* ==========================================================================
   符号约定：缩写表 + 正体/斜体的规矩。写题前扫一眼。
   ========================================================================== */

const WHY = [
  {
    title: '变量斜体，常数与算子正体',
    body: '数学排版的老规矩（ISO 80000-2 也这么写）：\(x\)、\(y\)、\(f\) 这类变量与函数名用斜体；\(\\e\)、\(\\i\)、\(\\d\) 这类固定含义的常数与算子用正体。不是为了好看，是为了不歧义——\\(e^x\\) 里的 e 如果斜体，读的人没法一眼分清它是自然常数还是某个变量。',
  },
  {
    title: '所以本站的写法',
    body: '自然常数写成 \\(\\e\\)，虚数单位写成 \\(\\i\\)，微分算子写成 \\(\\d\\)，转置写成 \\(A\\T\\)。构建时这些缩写会展开成 \\(\\mathrm{e}\\)、\\(\\mathrm{i}\\)、\\(\\mathrm{d}\\)、\\(^{\\mathrm{T}}\\)，所以在页面上、在导出的 PDF 里看到的都是正体。',
  },
]

const PAIRS = [
  ['\\(e^x\\)', '\\(\\e^x\\)', '自然常数要正体'],
  ['\\(e^{2x}\\sin x\\)', '\\(\\e^{2x}\\sin x\\)', '指数上的正体更明显'],
  ['\\(\\frac{dy}{dx}\\)', '\\(\\frac{\\d y}{\\d x}\\)', '微分算子 d 正体，变量 x 斜体'],
  ['\\(\\int_0^1 x^2 dx\\)', '\\(\\int_0^1 x^2\\,\\d x\\)', '积分末尾的 d 也要正体'],
  ['\\(i^2=-1\\)', '\\(\\i^2=-1\\)', '虚数单位正体'],
  ['\\(A^T\\)', '\\(A\\T\\)', '转置用正体 T'],
  ['\\(|x-1|<\\varepsilon\\)', '\\(\\abs{x-1}<\\eps\\)', '绝对值也顺手短写'],
]

export function buildNotation(ctx) {
  const rows = SHORTHANDS.map((s) => {
    const example = s.key.includes('…')
      ? s.key.replace('…', 'x-1')
      : s.key === '\\T'
        ? `A${s.key}`
        : `${s.key}`
    return `<tr>
      <td class="nt__key"><code>${esc(s.key)}</code></td>
      <td class="nt__out"><code>${esc(s.tex.replace(/\\\\/g, '\\'))}</code></td>
      <td class="nt__demo">${ctx.renderMarkdown(`\\(${example.replace(/\\\\/g, '\\')}\\)`, { errors: [] })}</td>
      <td class="nt__note">${esc(s.note)}</td>
    </tr>`
  }).join('')

  const pairRows = PAIRS.map(
    ([bad, good, note]) => `<tr>
      <td class="nt__bad">${ctx.renderMarkdown(bad, { errors: [] })}</td>
      <td class="nt__good">${ctx.renderMarkdown(good, { errors: [] })}</td>
      <td class="nt__note">${esc(note)}</td>
    </tr>`,
  ).join('')

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '符号' }])}

  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">符号与缩写</h1>
      <div class="pagehead__scope">
        <p>题目与解析里统一用一套符号。写题时可以用缩写，构建时会展开成标准 TeX；读题时看到的就是下面这些形状。</p>
        <div class="pagehead__stats">
          <span>${SHORTHANDS.length} 条缩写</span>
          <span>展开在构建时完成</span>
          <span><a href="${url(1, 'submit/')}">去投稿</a></span>
        </div>
      </div>
    </div>
  </header>

  <section class="section--tight">
    <div class="rule-head"><h2>为什么 e 要正体</h2><p>这条规矩不是审美偏好。</p></div>
    <div class="nt-why">
      ${WHY.map(
        (w) => `<article class="nt-why__item">
        <h3>${esc(w.title)}</h3>
        <p>${ctx.renderMarkdown(w.body, { errors: [] })}</p>
      </article>`,
      ).join('')}
    </div>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>改写对照</h2><p>左边是常见写法，右边是本站的统一写法。两列都能读，但右列不会让人误会。</p></div>
    <table class="nt-table">
      <thead><tr><th>常见写法</th><th>本站写法</th><th>说明</th></tr></thead>
      <tbody>${pairRows}</tbody>
    </table>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>缩写表</h2><p>写题时直接打左边这一列。缩写后面紧跟字母时不生效，所以 <code>\\exp</code>、<code>\\det</code>、<code>\\delta</code> 都不会被误伤。</p></div>
    <table class="nt-table nt-table--short">
      <thead><tr><th>缩写</th><th>展开成</th><th>渲染效果</th><th>说明</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>还有几条</h2><p>不缩写，但常写错。</p></div>
    <ul class="ticks">
      <li>函数名用反斜杠：<code>\\sin x</code>、<code>\\ln x</code>、<code>\\lim_{x\\to 0}</code>，不要写 <code>sin x</code>（会被当成三个变量相乘）。</li>
      <li>行内公式用 <code>\\( \\)</code>，独立公式用 <code>\\[ \\]</code>；正文里的 <code>$</code> 不解析成公式。</li>
      <li>矩阵用 <code>\\begin{pmatrix} … \\end{pmatrix}</code>，圆括号；行间公式里的矩阵不要写在一行。</li>
      <li>多重积分与偏导：<code>\\iint</code>、<code>\\partial</code>；求导撇号直接写 <code>f'(x)</code>。</li>
    </ul>
  </section>
</div>`

  write(
    ctx,
    'notation/index.html',
    page(ctx, {
      depth: 1,
      title: '符号与缩写',
      description: '本站的数学符号约定与 TeX 缩写表：e、i、d 用正体，\\abs、\\R、\\rank 之类的短写会在构建时展开。',
      body,
      bodyClass: 'detail',
      navActive: '',
    }),
  )
}
