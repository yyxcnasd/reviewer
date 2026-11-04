import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

import { page, write, url, esc, attr, crumb } from '../lib/site.mjs'

/* ==========================================================================
   速查表：一门课一份，A4 横向三栏，可以只打印某一门。
   ========================================================================== */

export function buildCheatsheet(ctx) {
  const dir = path.join(ctx.CONTENT, 'cheatsheet')
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : []
  const legacy = path.join(ctx.CONTENT, 'cheatsheet.md')
  if (!files.length && fs.existsSync(legacy)) files.push('../cheatsheet.md')

  const sheets = files
    .map((name) => {
      const file = name === '../cheatsheet.md' ? legacy : path.join(dir, name)
      const raw = fs.readFileSync(file, 'utf8')
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
      const meta = m ? yaml.load(m[1]) || {} : {}
      const body = m ? m[2] : raw
      const course = ctx.courseById.get(meta.course) || { id: meta.course || name.replace('.md', ''), name: meta.title || name }
      const html = ctx.renderMarkdown(body, { errors: ctx.errors })
      const groups = (html.match(/<h[23][ >]/g) || []).length
      return { id: course.id, name: meta.title || course.name, html, headings: groups }
    })
    .filter((s) => s.html.trim())
    .sort((a, b) => ctx.courses.findIndex((c) => c.id === a.id) - ctx.courses.findIndex((c) => c.id === b.id))

  if (!sheets.length) return

  const total = sheets.reduce((n, s) => n + s.headings, 0)

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '速查' }])}
  <header class="pagehead pagehead--wide">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">速查表</h1>
      <div class="pagehead__scope sheet-toolbar">
        <p class="sheet-toolbar__lead">每门课最常用的一批结论。A4 横向三栏，一张纸一门课，打印时自动分页。</p>
        <div class="sheet-toolbar__actions">
          <label class="sr-only" for="sheet-pick">选择科目</label>
          <select class="select" id="sheet-pick">
            <option value="">全部 ${sheets.length} 门课（${total} 组结论）</option>
            ${sheets.map((s) => `<option value="${s.id}">${esc(s.name)}（${s.headings} 组）</option>`).join('')}
          </select>
          <button class="btn btn--red" type="button" id="sheet-print">打印</button>
        </div>
      </div>
  </header>

  ${sheets
    .map(
      (s) => `<section class="sheet-course" data-sheet="${s.id}">
    <h2 class="sheet-course__title">${esc(s.name)}</h2>
    <div class="sheet__body prose">${s.html}</div>
  </section>`,
    )
    .join('')}
</div>
<script>
  ;(() => {
    const pick = document.getElementById('sheet-pick')
    const btn = document.getElementById('sheet-print')
    if (!pick || !btn) return
    btn.addEventListener('click', () => {
      for (const cls of [...document.body.classList]) {
        if (cls.startsWith('printing-')) document.body.classList.remove(cls)
      }
      if (pick.value) document.body.classList.add('printing-' + pick.value)
      if (window.RB && window.RB.printAll) window.RB.printAll()
      else window.print()
    })
  })()
</script>`

  write(
    ctx,
    'cheatsheet/index.html',
    page(ctx, {
      depth: 1,
      title: '速查表',
      description: `${sheets.map((s) => s.name).join('、')}的常用结论速查表，A4 横向三栏，可按科目打印。`,
      body,
      bodyClass: 'detail',
      navActive: 'cheatsheet',
      // 速查表整页横向 A4；放在 head 里，压过后面的全局 @page
      head: "<style>@media print { @page { size: A4 landscape; margin: 10mm 10mm 12mm; } .sitehead, .footer, .crumb, .pagehead { display: none !important; } .frame { width: auto; padding: 0; } }</style>",
    }),
  )
}
