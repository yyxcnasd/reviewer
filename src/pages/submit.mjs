import { page, write, url, esc, attr, crumb } from '../lib/site.mjs'

/* ==========================================================================
   投稿：先选大分类；题目挂不挂课程都行（「其他」可以不挂）；
   编辑器是 Markdown 工具条 + 自动配对括号 + 可撤销。
   ========================================================================== */

export function buildSubmit(ctx) {
  const categories = ctx.taxonomy.categories
    .map((c) => `<option value="${c.id}">${esc(c.label)}</option>`)
    .join('')

  const courseOptions = ctx.courses
    .filter((c) => c.id !== 'other')
    .map((c) => `<option value="${c.id}">${esc(c.name)}</option>`)
    .join('')

  const chaptersByCourse = Object.fromEntries(
    ctx.courses.map((c) => [
      c.id,
      c.chapters
        .map(
          (ch) =>
            `<option value="${ch.id}">${ch.no ? `第 ${esc(ch.no)} 章 ` : ''}${esc(ch.title)}</option>`,
        )
        .join(''),
    ]),
  )

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '投稿' }])}

  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">投稿一道题</h1>
      <div class="pagehead__scope">
        <p>左边写、右边预览。<a href="${url(1, 'notation/')}">符号与写法</a>里写了公式、区块和题目格式。</p>
        </div>
      </div>
    </div>
  </header>

  <div class="frame frame--wide"><div class="submit">
    <form class="submit__form" id="submit-form" data-repo="${attr(ctx.config.repo)}" onsubmit="return false">
      <fieldset class="fieldset">
        <legend>分类</legend>
        <div class="submit__row">
          <div class="field">
            <label for="s-category">大分类</label>
            <select class="select" id="s-category">${categories}</select>
          </div>
          <div class="field">
            <label for="s-course">课程 <span class="hint-inline">可不选</span></label>
            <select class="select" id="s-course">
              <option value="">不属于任何课程</option>
              ${courseOptions}
            </select>
          </div>
        </div>
        <div class="submit__row">
          <div class="field">
            <label for="s-chapter">章节 <span class="hint-inline">选了课程才有</span></label>
            <select class="select" id="s-chapter" disabled>
              <option value="">—</option>
            </select>
          </div>
          <div class="field">
            <label for="s-tags">标签</label>
            <input class="input" id="s-tags" type="text" placeholder="用逗号分开，比如：泰勒公式, 极限计算" list="tag-suggestions" autocomplete="off">
            <datalist id="tag-suggestions">
              ${ctx.taxonomy.tags.map((t) => `<option value="${attr(t)}"></option>`).join('')}
            </datalist>
          </div>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend>题本身</legend>
        <div class="submit__row">
          <div class="field">
            <label for="s-difficulty">难度</label>
            <select class="select" id="s-difficulty">
              <option value="1">1 基础</option>
              <option value="2" selected>2 常规</option>
              <option value="3">3 综合</option>
              <option value="4">4 挑战</option>
            <option value="5">5 硬核</option></select>
          </div>
          <div class="field">
            <label for="s-kind">题型</label>
            <select class="select" id="s-kind">
              <option>计算题</option><option>证明题</option><option>概念题</option><option>综合题</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="s-origin">署名 <span class="hint-inline">可选</span></label>
          <input class="input" id="s-origin" type="text" placeholder="留空就是佚名">
        </div>
      </fieldset>

      <div class="field">
        <div class="mdbar" role="toolbar" aria-label="Markdown 格式">
          <div class="mdbar__group">
            <button type="button" data-md="bold" title="加粗 Ctrl+B"><b>B</b></button>
            <button type="button" data-md="italic" title="斜体 Ctrl+I"><i>I</i></button>
            <button type="button" data-md="code" title="行内代码">代码</button>
          </div>
          <div class="mdbar__group">
            <button type="button" data-md="math" title="行内公式">行内公式</button>
            <button type="button" data-md="display" title="独立公式">独立公式</button>
          </div>
          <div class="mdbar__group">
            <button type="button" data-md="list" title="无序列表">列表</button>
            <button type="button" data-md="quote" title="引用">引用</button>
            <button type="button" data-md="heading" title="小标题">小标题</button>
          </div>
          <div class="mdbar__group mdbar__group--right">
            <button type="button" data-md="focus" title="专注写作：隐藏右侧预览">专注</button>
          </div>
        </div>
        <label class="sr-only" for="s-stem">题面</label>
        <textarea class="textarea textarea--code" id="s-stem" rows="7" spellcheck="false" placeholder="设 \(f(x)=\dfrac{1}{1+x}\)，求 \(f^{(n)}(0)\)。"></textarea>
        <div class="mdmeta">
          <p class="hint">括号、$、反引号自动配对 · Tab 跳出 · Ctrl+B 加粗 · Ctrl+I 斜体 · Ctrl+Z 撤销。数学可用缩写 <code>\e</code> <code>\d</code> <code>\abs{}</code> <code>\R</code>，见<a href="${url(1, 'notation/')}">符号与缩写</a>。</p>
          <p class="mdcount" id="s-count" aria-live="polite"></p>
        </div>
      </div>

      <div class="submit__row">
        <div class="field">
          <label for="s-answer">答案 <span class="hint-inline">可选</span></label>
          <input class="input" id="s-answer" type="text" placeholder="\((-1)^{n}n!\)">
        </div>
        <div class="field">
          <label for="s-hint">提示 <span class="hint-inline">可选</span></label>
          <input class="input" id="s-hint" type="text" placeholder="一句话的抓手，别剧透">
        </div>
      </div>

      <div class="field">
        <label for="s-solution">解析</label>
        <textarea class="textarea textarea--code" id="s-solution" rows="7" spellcheck="false" placeholder="先说抓什么，再推导；每一步的依据写清楚。"></textarea>
      </div>

      <div class="field">
        <label for="s-mistakes">常见错误 <span class="hint-inline">可选</span></label>
        <textarea class="textarea textarea--code" id="s-mistakes" rows="2" spellcheck="false" placeholder="真实会犯的错：等价无穷小乱替换、漏掉符号…"></textarea>
      </div>

      <div class="submit__actions">
        <button class="btn btn--red" id="s-issue" type="button">在 GitHub 开 issue</button>
        <button class="btn" id="s-download" type="button">下载 .md</button>
        <button class="btn btn--tone" id="s-copy" type="button">复制 Markdown</button>
        <button class="btn btn--tone" id="s-reset" type="button">清空</button>
      </div>
      <p class="submit__status" id="s-status" aria-live="polite"></p>
    </form>

    <aside class="submit__preview">
      <h2><span>预览</span><span id="p-file">content/questions/…</span></h2>
      <div class="prose" id="preview">
        <p class="hint">左边写，这里出排版结果。</p>
      </div>
      <h2 class="submit__preview-sub">生成的 frontmatter</h2>
      <pre class="submit__fm" id="p-frontmatter"></pre>
    </aside>
  </div>

  <section class="section--tight">
    <div class="rule-head"><h2>投稿之后</h2></div>
    <ol class="flow">
      <li><b>提</b><span>issue 里带着完整的 frontmatter 和文件名建议；太长放不下就下载 .md 附在评论里</span></li>
      <li><b>审</b><span>管理员看数学、看标签与难度、看有没有重复，必要时在 issue 里讨论</span></li>
      <li><b>归档</b><span>合并后自动进题库、标签页和对应章节，范围与统计一起更新</span></li>
    </ol>
  </section>
</div></div>
<script src="${url(1, 'assets/shorthands.js')}"></script>
<script src="${url(1, 'assets/blocks.js')}"></script>
<script>window.__CHAPTERS__ = ${JSON.stringify(chaptersByCourse).replace(/</g, '\\u003c')}</script>
<script src="${url(1, 'assets/vendor/markdown-it.min.js')}"></script>
<script src="${url(1, 'assets/vendor/katex.min.js')}"></script>
<script src="${url(1, 'assets/submit.js')}" defer></script>`

  write(
    ctx,
    'submit/index.html',
    page(ctx, {
      depth: 1,
      title: '投稿',
      description: '写一道题，实时预览，一键开 issue 或下载 Markdown；课内的题和课外的题都能投。',
      body,
      bodyClass: 'detail',
      navActive: 'submit',
    }),
  )
}
