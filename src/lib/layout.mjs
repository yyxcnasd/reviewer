import fs from 'node:fs'
import path from 'node:path'

/* ---------------------------------------------------------------- 小工具 */

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const attr = esc

export function write(ctx, relPath, content) {
  const full = path.join(ctx.OUT, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
  ctx.written.push(relPath)
}

export function url(depth, p) {
  const up = depth === 0 ? '' : '../'.repeat(depth)
  return up + p
}

/* 把一页的标题、描述、导航包成完整 HTML */
export function page(ctx, opts) {
  const { config } = ctx
  const depth = opts.depth ?? 0
  const base = depth === 0 ? './' : '../'.repeat(depth)
  const title = opts.title ? `${opts.title} · ${config.name}` : `${config.name} · 课程复习资料与题库`
  const desc = opts.description || config.description
  const navCourses = ctx.courses.filter((course) => course.id !== 'other')
  const navItems = [
    { label: '题库', href: 'questions/', key: 'questions' },
    { label: '刷题', href: 'practice/', key: 'practice' },
    { label: '速查', href: 'cheatsheet/', key: 'cheatsheet' },
    { label: '进度', href: 'stats/', key: 'stats' },
  ]
  const courseMenu = `<li class="nav__menu-wrap">
          <details class="navmenu">
            <summary>课程</summary>
            <ul class="navmenu__list">
              ${navCourses
                .map((course) => {
                  const onlyFinal = course.terms && !course.terms.includes('midterm')
                  const tag = onlyFinal ? '<span class="navmenu__tag">仅期末</span>' : ''
                  const cur = opts.navActive === course.id ? ' aria-current="page"' : ''
                  return `<li><a href="${base}${course.id}/"${cur}>${esc(course.name)}${tag}</a></li>`
                })
                .join('')}
              <li class="navmenu__sep"><a href="${base}questions/">题库（全部课程）</a></li>
            </ul>
          </details>
        </li>`

  const nav = `
  <header class="sitehead">
    <div class="frame">
      <nav class="nav" aria-label="主导航">
        <a class="nav__mark" href="${base}"><span class="nav__dot" aria-hidden="true"></span>${esc(config.wordmark)}</a>
        <ul class="nav__links">
          ${courseMenu}
          ${navItems
            .map(
              (n) =>
                `<li><a href="${base}${n.href}"${opts.navActive === n.key ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`,
            )
            .join('\n          ')}
        </ul>
        <div class="nav__end">
          <div class="nav__terms" role="group" aria-label="考试轮次">
            ${ctx.terms
              .map(
                (t, i) =>
                  `<button class="term-btn${i === 0 ? ' is-on' : ''}" type="button" data-term-btn="${t.id}">${esc(t.label)}</button>`,
              )
              .join('')}
          </div>
          <button class="ghost nav__theme" id="theme-toggle" type="button" aria-live="polite">深色</button>
          <a class="btn btn--red nav__action" href="${base}submit/">投稿</a>
        </div>
      </nav>
    </div>
  </header>`

  const footer = `
  <footer class="footer">
    <div class="frame">
      <a class="footer__word" href="${base}" aria-label="回到首页：${esc(config.wordmark)}"><span aria-hidden="true">${esc(config.wordmark)}</span></a>
      <div class="footer__cols">
        <div class="footer__col">
          <h3>科目</h3>
          <ul>
            <li><a href="${base}va1/">微积分 A1</a></li>
            <li><a href="${base}la/">线性代数</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3>内容</h3>
          <ul>
            <li><a href="${base}questions/">题库（${ctx.stats.questions} 道）</a></li>
            <li><a href="${base}practice/">刷题</a></li>
            <li><a href="${base}tags/">标签</a></li>
            <li><a href="${base}export/">导出 PDF</a></li>
            <li><a href="${base}stats/">进度</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3>参与</h3>
          <ul>
            <li><a href="${base}submit/">投稿一道题</a></li>
            <li><a href="${base}about/">关于与范围说明</a></li>
            <li><a href="https://github.com/${esc(config.repo)}" target="_blank" rel="noopener noreferrer">GitHub 仓库</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3>这本册子</h3>
          <ul>
            <li>${esc(config.semester)} 期中版</li>
            <li>内容 CC BY-SA 4.0</li>
            <li>构建于 ${new Date().toISOString().slice(0, 10)}</li>
          </ul>
        </div>
      </div>
      <div class="footer__legal">
        <span>${esc(config.name)} · ${esc(config.tagline)}</span>
        <span>${esc(config.credits.license)}</span>
      </div>
    </div>
  </footer>`

  return `<!doctype html>
<html lang="${esc(config.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${attr(desc)}">
<meta name="color-scheme" content="light">
<link rel="stylesheet" href="${base}assets/katex/katex.min.css">
<link rel="stylesheet" href="${base}assets/site.css">
<script>
  // 先按本地设置（或系统偏好）定主题，避免刷新时闪白
  try {
    // 默认浅色（纸面）。只有你手动切过深色，才在下次打开时记住。
    if (localStorage.getItem('reviewer.theme') === 'dark')
      document.documentElement.setAttribute('data-theme', 'dark')
  } catch (e) {}
</script>
<script src="${base}assets/core.js"></script>
<script src="${base}assets/theme.js" defer></script>
<script src="${base}assets/term.js" defer></script>
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_CN">
${opts.head || ''}
</head>
<body class="no-js${opts.bodyClass ? ' ' + opts.bodyClass : ''}">
<script>document.body.classList.remove('no-js')</script>
<a class="skip" href="#main">跳到正文</a>
${nav}
<main id="main">
${opts.body}
</main>
${footer}
<script src="${base}assets/progress.js" defer></script>
<script src="${base}assets/site.js" defer></script>
${opts.scripts || ''}
</body>
</html>`
}

/* 章节 id → 课程，用来做链接与颜色 */
export function chapterCtx(ctx, chapter) {
  const course = ctx.courseById.get(chapter.courseId)
  return { course, chapter }
}

export function stateLabel(state) {
  if (state === 'in') return '在范围内'
  if (state === 'boundary') return '止于此处'
  if (state === 'partial') return '部分在范围'
  return '不在本轮范围'
}

export function dots(n) {
  return `<span class="dots" aria-label="难度 ${n} / 4">${[1, 2, 3, 4]
    .map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`)
    .join('')}</span>`
}

export function slugTag(ctx, tag) {
  return encodeURIComponent(tag)
}

export function tagHref(depth, tag) {
  return `${url(depth, 'tags/' + encodeURIComponent(tag) + '.html')}`
}

/* 题目在列表里显示的那一行。
   题面常常是「设」加一段行间公式，只取第一段会只剩一个字，
   所以第一段太短时连上第二段，并把行间公式改成行内，别让列表行长出大公式。 */
export function stemExcerpt(ctx, q) {
  const paras = String(q.stem).split(/\n\s*\n/)
  const plainOf = (s) => s.replace(/\\\([\s\S]*?\\\)/g, '').replace(/\$[^$\n]*\$/g, '').trim()
  let text = (paras[0] || '').trim()
  if (plainOf(text).length < 8 && paras[1]) {
    const second = (paras[1] || '').trim()
    if (!second.includes('\\begin') && second.length <= 40) text = text + ' ' + second
  }
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '\\($1\\)')
  if (plainOf(text).length < 6 && q.tags && q.tags.length) text = text + ' · ' + q.tags[0]
  if (text.length > 200) text = text.slice(0, 198) + '……'
  let html = ctx.renderMarkdown(text, { errors: ctx.errors })
  // 链接里不能放段落块：剥掉唯一的一层 <p>
  const m = html.match(/^<p>([\s\S]*)<\/p>\s*$/)
  if (m && !m[1].includes('<p>')) html = m[1]
  return html
}
