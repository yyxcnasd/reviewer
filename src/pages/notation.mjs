import { aboutTabs, page, write, url, esc, attr, crumb } from '../lib/site.mjs'
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
    body: '自然常数写成 \\(\\e\\)，虚数单位写成 \\(\\i\\)，微分算子写成 \\(\\d\\)，转置写成 \\(A\\T\\)（⊤）。构建时这些缩写会展开成 \\(\\mathrm{e}\\)、\\(\\mathrm{i}\\)、\\(\\mathrm{d}\\)、\\(^{\\mathrm{T}}\\)，所以在页面上、在导出的 PDF 里看到的都是正体。',
  },
]

const PAIRS = [
  ['\\(e^x\\)', '\\(\\e^x\\)', '自然常数要正体'],
  ['\\(e^{2x}\\sin x\\)', '\\(\\e^{2x}\\sin x\\)', '指数上的正体更明显'],
  ['\\(\\frac{dy}{dx}\\)', '\\(\\frac{\\d y}{\\d x}\\)', '微分算子 d 正体，变量 x 斜体'],
  ['\\(\\int_0^1 x^2 dx\\)', '\\(\\int_0^1 x^2\\,\\d x\\)', '积分末尾的 d 也要正体'],
  ['\\(i^2=-1\\)', '\\(\\i^2=-1\\)', '虚数单位正体'],
  ['\\(A^T\\)', '\\(A\\T\\)', '转置写 ⊤'],
  ['\\(|x-1|<\\varepsilon\\)', '\\(\\abs{x-1}<\\eps\\)', '绝对值也顺手短写'],
]

const BLOCKS = [
  { word: ':::theorem[中值定理]', note: '类型 + 方括号标题', sample: ':::theorem[中值定理]\n若 $f$ 在 $[a,b]$ 上连续……\n:::' },
  { word: ':::definition', note: '定义，可不带标题', sample: ':::definition\n设 $f$ 在 $x_0$ 的邻域内有定义……\n:::' },
  { word: ':::warning[易错]', note: '注意 / 易错，红色线', sample: ':::warning[易错]\n分子必须同时出现 $f(x_0+h)$ 与 $f(x_0)$。\n:::' },
  { word: ':::tip[提示]', note: '提示、小技巧，蓝色线', sample: ':::tip[提示]\n先把公式配成标准形式再算。\n:::' },
  { word: ':::example[3.1]', note: '例题，标题写编号', sample: ':::example[3.1]\n求 $x^2$ 的导数。\n:::' },
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
<div class="frame nt-page">

  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { href: 'about/', label: '关于' }, { label: '符号与写法' }])}

  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">符号与写法</h1>
      <div class="pagehead__scope">
        <p>题目、要点、投稿都按这一页的写法。上面是符号约定，下面是排版语法。</p>
        <div class="pagehead__stats">
          <span>${SHORTHANDS.length} 条缩写</span>
          <span><a href="${url(1, 'submit/')}">去投稿</a></span>
        </div>
      </div>
    </div>
  </header>

  <section class="section--tight">
    <div class="rule-head"><h2>为什么 e 要正体</h2></div>
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
    <div class="rule-head"><h2>改写对照</h2></div>
    <table class="nt-table">
      <thead><tr><th>常见写法</th><th>本站写法</th><th>说明</th></tr></thead>
      <tbody>${pairRows}</tbody>
    </table>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>缩写表</h2><p>缩写后紧跟字母时不生效。</p></div>
    <table class="nt-table nt-table--short">
      <thead><tr><th>缩写</th><th>展开成</th><th>渲染效果</th><th>说明</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>还有几条</h2></div>
    <ul class="ticks">
      <li>函数名用反斜杠：<code>\\sin x</code>、<code>\\ln x</code>、<code>\\lim_{x\\to 0}</code>，不要写 <code>sin x</code>（会被当成三个变量相乘）。</li>
      <li>行内公式用 <code>\\( \\)</code>，独立公式用 <code>\\[ \\]</code>；正文里的 <code>$</code> 不解析成公式。</li>
      <li>矩阵用 <code>\\begin{pmatrix} … \\end{pmatrix}</code>，圆括号；行间公式里的矩阵不要写在一行。</li>
      <li>多重积分与偏导：<code>\\iint</code>、<code>\\partial</code>；求导撇号直接写 <code>f'(x)</code>。</li>
    </ul>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>区块</h2><p>定义、定理、例、注意这类内容一律用 <code>:::</code> 包起来，整块缩进并带彩色竖条。类型词只接受英文关键词，标题写在方括号里。</p></div>
    <div class="nt-blocks">
      ${BLOCKS.map((b) => `<div class="mdx-block">
        <pre>${esc(b.sample)}</pre>
        <div class="mdx-block__note"><b>${esc(b.word)}</b><span>${esc(b.note)}</span></div>
      </div>`).join('')}
    </div>
    <table class="nt-table"><thead><tr><th>类型</th><th>显示</th><th>颜色</th></tr></thead><tbody>
      <tr><td><code>theorem</code> <code>lemma</code> <code>proposition</code></td><td>定理 / 引理 / 命题</td><td>墨色</td></tr>
      <tr><td><code>definition</code></td><td>定义</td><td>墨色</td></tr>
      <tr><td><code>corollary</code> <code>conclusion</code></td><td>推论 / 结论</td><td>墨色</td></tr>
      <tr><td><code>example</code></td><td>例</td><td>蓝色</td></tr>
      <tr><td><code>warning</code> <code>danger</code> <code>caution</code> <code>note</code></td><td>注意</td><td>红色</td></tr>
      <tr><td><code>info</code> <code>tip</code> <code>remark</code></td><td>提示</td><td>蓝色</td></tr>
      <tr><td><code>proof</code></td><td>证明</td><td>灰色</td></tr>
    </tbody></table>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>Markdown</h2></div>
    <pre><code>## 二级标题
### 三级标题

- 无序列表
1. 有序列表

| 类型 | 字节 |
| --- | --- |
| int | 4 |</code></pre>
    <p>代码块里的 <code>$</code> 与反斜杠不会被当成公式，可以放心写汇编和 LaTeX 源码。</p>
  </section>

  <section class="section--tight">
    <div class="rule-head"><h2>题目怎么写</h2></div>
    <ul class="ticks">
      <li>题面直接写，不要加「题目：」前缀；分小问用 <code>(1)</code>、<code>(2)</code>。</li>
      <li><code>## 提示</code>、<code>## 解析</code>、<code>## 常见错误</code> 三段，顺序固定。</li>
      <li>解析里说清「关键的那一步为什么能想到」，别只贴过程。</li>
      <li>多行推导用 <code>\begin{aligned}</code> 或 <code>\begin{cases}</code>，不要用表格写步骤链。</li>
      <li>类型词只认英文：<code>definition</code> <code>theorem</code> <code>lemma</code> <code>proposition</code> <code>corollary</code> <code>property</code> <code>conclusion</code> <code>example</code> <code>note</code> <code>warning</code> <code>tip</code> <code>proof</code>；中文类型词不再解析。</li>
    </ul>
  </section>
</div>`

  write(
    ctx,
    'notation/index.html',
    page(ctx, {
      depth: 1,
      title: '符号与写法',
      description: '本站的数学符号约定、TeX 缩写、::: 区块语法与题目写法。',
      body,
      bodyClass: 'detail',
      navActive: 'notation',
    }),
  )
}
