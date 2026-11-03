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

/* ---------------------------------------------------------------- 投稿 */

export function buildSubmit(ctx) {
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
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '投稿' }])}
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
