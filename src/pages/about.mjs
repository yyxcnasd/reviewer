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
    <p>范围写在 <code>content/courses.yml</code> 里，按考试轮次分开写。导航右上角切换轮次，范围表、考纲、题目页的范围、题库的筛选会一起变。</p>
    <p><b>期中</b>：微积分 A1 到第 4.3 节泰勒公式（含）——实数系与数列极限、函数极限与连续、导数与微分、中值定理与洛必达、泰勒公式；线性代数到第 3 章向量组的秩之前——线性方程组与行列式、矩阵、n 维向量与线性相关。</p>
    <p><b>期末</b>：两门课整本。微积分 A1 第 1–7 章（加上定积分、广义积分、常微分方程），线性代数第 1–4 章（加上秩与解的结构）。</p>
    <p>以任课教师的正式通知为准。要改范围，改 <code>courses.yml</code> 里对应小节的那一行，不用动页面代码。</p>

    <h2>内容怎么组织的</h2>
    <p>所有中文内容都是仓库里的 Markdown 文件：一题一个文件放在 <code>content/questions/</code>，一章要点一个文件放在 <code>content/notes/</code>，章节与轮次范围写在 <code>content/courses.yml</code>。构建脚本读这些文件，生成题库、标签页、章节索引和这一页。</p>
    <p>题目全部自编，难度按「基础、常规、综合、挑战」四档标，个别难题会写明关键那一步怎么想到。图片来自公有领域与开放授权的藏品，出处见下表。</p>

    <h2>技术</h2>
    <p>纯静态站点。一个 Node 脚本把 Markdown 生成 HTML，公式用 KaTeX 在构建时渲染成 HTML，关掉 JavaScript 也能读题。部署在 GitHub Pages，链接都是相对路径，放在任何子路径下都能用。</p>

    <h2>许可</h2>
    <p>本站文字与题目以 CC BY-SA 4.0 发布，代码以 MIT 发布。图片版权属于各自的收藏机构，见下表。</p>

    <h2>常见问题</h2>
    <p><b>范围以哪个为准？</b>任课教师的正式通知。本站按课本目录整理，期中、期末两套范围可以在右上角切换。</p>
    <p><b>现在有多少道题？</b>${ctx.stats.questions} 道，全部自编，每题都有提示、解析和一条常见错误。</p>
    <p><b>为什么有些章节是灰的？</b>那是不在当前轮次范围里的内容。切到另一个轮次，颜色会跟着变。</p>
    <p><b>进度存在哪里？</b>「已做」「收藏」只存在你自己的浏览器（localStorage），不上传，换设备或清缓存就没了。</p>
    <p><b>投稿要写什么格式？</b>Markdown，公式用 \( \) 和 \[ \]。缩写（<code>\e</code>、<code>\d</code>、<code>\abs{}</code> 之类）见<a href="${url(1, 'notation/')}">符号与缩写</a>。投稿页有实时预览，会顺手生成 frontmatter 和文件名。</p>
    <p><b>题目合并之后会怎样？</b>它会成为 content/questions/ 下的一个文件，出现在题库、对应标签页和所属章节里。</p>
    <p><b>能打印吗？</b>能。速查表、每篇要点、每道题都有打印样式；整份卷子在「导出」页生成，A4 排版。</p>

    <h2>图片来源</h2>
    <table>
      <thead><tr><th>文件</th><th>来源与授权</th><th>页面</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
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
