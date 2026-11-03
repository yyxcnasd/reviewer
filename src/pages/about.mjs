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

/* ---------------------------------------------------------------- 关于 */

export function buildAbout(ctx) {
  const credits = loadCredits(ctx)
  const rows = credits
    .map(
      (c) =>
        `<tr><td>${esc(c.file)}</td><td>${esc(c.credit)}</td><td><a href="${attr(c.page)}" target="_blank" rel="noopener noreferrer">来源</a></td></tr>`,
    )
    .join('')

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '关于' }])}
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

export function loadCredits(ctx) {
  const p = path.join(ctx.ROOT, 'src/assets/photos/credits.json')
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
