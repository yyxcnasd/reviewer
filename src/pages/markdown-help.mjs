import { page, write, url, crumb, esc } from '../lib/site.mjs'
import { SHORTHANDS } from '../shorthands.mjs'

/* ==========================================================================
   写法说明：清楚到可以照着写，不用查别处。
   ========================================================================== */

const BLOCKS = [
  {
    word: '定义',
    note: '定义、约定。最深的一档，用墨色线。',
    sample: ':::定义\n设 $f$ 在 $x_0$ 的邻域内有定义……\n:::',
  },
  {
    word: '定理',
    note: '定理、命题、引理（写「引理」「命题」等价）。',
    sample: ':::定理 中值定理\n若 $f$ 在 $[a,b]$ 上连续、在 $(a,b)$ 内可导……\n:::',
  },
  {
    word: '结论',
    note: '可以直接拿来用的结论、公式。',
    sample: ':::结论\n$\\sin x\\sim x$（$x\\to 0$）。\n:::',
  },
  {
    word: '例',
    note: '例题、示例（写「例题」等价），可带编号。',
    sample: ':::例 3.1\n求 $x^2$ 的导数。\n:::',
  },
  {
    word: '注意',
    note: '易错点、警告（写「易错」「警告」等价），红色线。',
    sample: ':::注意\n分子必须同时出现 $f(x_0+h)$ 与 $f(x_0)$。\n:::',
  },
  {
    word: '提示',
    note: '小技巧、提示，蓝色线。',
    sample: ':::提示\n先把公式配成标准形式再算。\n:::',
  },
  {
    word: '证明',
    note: '证明过程，浅灰线，收敛一点。',
    sample: ':::证明\n由中值定理……\n:::',
  },
]

export function buildMarkdownHelp(ctx) {
  const shorthandRows = SHORTHANDS.map((s) => {
    const tex = s.key.endsWith('{}') ? s.key.replace('{}', '{x}') : s.key
    const rendered = ctx.renderMarkdown(`\\(${tex}\\)`, { errors: [] })
    return `<tr><td><code>${esc(s.key)}</code></td><td>${rendered}</td><td>${esc(s.note || '')}</td></tr>`
  }).join('')

  const blockRows = BLOCKS.map(
    (b) => `<div class="mdx-block">
      <div class="mdx-block__code"><pre>${esc(b.sample)}</pre></div>
      <div class="mdx-block__note"><b>${esc(b.word)}</b><span>${esc(b.note)}</span></div>
    </div>`,
  ).join('')

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '写法说明' }])}
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">怎么写</h1>
      <div class="pagehead__scope">
        <p>投稿页和题库里的题目都按这套写法。大部分是普通 Markdown，额外加了一个「区块」语法。</p>
      </div>
    </div>
  </header>

  <div class="frame mdx">
    <section class="mdx__sec">
      <h2>公式</h2>
      <p>行内用 <code>\\( … \\)</code>，独立成行用 <code>\\[ … \\]</code>。这两种最稳，别用 <code>$…$</code>（和代码里的美元符号会打架）。</p>
      <pre><code>行内 \\(f'(x_0)\\) 与独立：

\\[
f'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}
\\]</code></pre>
      <p>常用符号有缩写，写起来短，渲染出来是规矩的正体：</p>
      <table class="nt-table"><thead><tr><th>写法</th><th>效果</th><th>说明</th></tr></thead><tbody>${shorthandRows}</tbody></table>
    </section>

    <section class="mdx__sec">
      <h2>区块</h2>
      <p>定义、定理、例、注意这类内容，用 <code>:::</code> 包起来。第一行写类型（可带标题），最后一行单独一个 <code>:::</code> 收尾。区块里可以照常写公式、列表、代码。</p>
      ${blockRows}
      <p>英文别名也能用：<code>definition</code>、<code>theorem</code>、<code>example</code>、<code>note</code>、<code>warn</code>、<code>tip</code>、<code>proof</code>。</p>
    </section>

    <section class="mdx__sec">
      <h2>标题、列表、表格</h2>
      <pre><code>## 二级标题
### 三级标题

- 无序列表
1. 有序列表

| 类型 | 字节 |
| --- | --- |
| int | 4 |</code></pre>
      <p>标题不要跳级（h2 下面直接 h3）；表格第一行是表头，第二行写 <code>| --- |</code>。</p>
    </section>

    <section class="mdx__sec">
      <h2>代码</h2>
      <pre><code>\`\`\`c
long f(long x) { return x * 2; }
\`\`\`</code></pre>
      <p>代码块里的 <code>$</code>、<code>\\</code> 不会被当成公式，可以放心写汇编和 LaTeX 源码。</p>
    </section>

    <section class="mdx__sec">
      <h2>题目怎么写</h2>
      <ul>
        <li>题面直接写，不要加「题目：」这样的前缀；分小问用 <code>(1)</code>、<code>(2)</code>。</li>
        <li>提示、解析、常见错误各用 <code>## 提示</code>、<code>## 解析</code>、<code>## 常见错误</code> 起头，顺序固定。</li>
        <li>解析里说清「关键的那一步为什么能想到」，别只贴过程。</li>
        <li>答案写结论本身，能一行写完就一行。</li>
      </ul>
    </section>
  </div>

  <div class="frame">
    <p class="mdx__more"><a href="${url(1, 'submit/')}">去投稿 →</a> <a href="${url(1, 'notation/')}">符号与缩写 →</a></p>
  </div>
</div>`

  write(
    ctx,
    'markdown/index.html',
    page(ctx, {
      depth: 1,
      title: '写法说明',
      description: '题目与投稿的 Markdown 写法：公式、区块（定义/定理/例/注意）、表格、代码。',
      body,
      bodyClass: 'detail',
      navActive: 'submit',
    }),
  )
}
