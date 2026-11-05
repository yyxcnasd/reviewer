import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

import { page, write, crumb, esc } from '../lib/site.mjs'

/* ==========================================================================
   速查表

   一门课可以有多个文件：
     va1.md          frontmatter terms: [midterm, final]  → 期中、期末都显示
     va1-extra.md    frontmatter terms: [final]           → 只在期末追加
   页面上按当前轮次显示「期中版 / 期末版」，期末版 = 期中内容 + 期末补充，
   所以「期中是期末的子集」这条结构关系是文件层面写死的。
   ========================================================================== */

export function buildCheatsheet(ctx) {
  const dir = path.join(ctx.CONTENT, 'cheatsheet')
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : []
  const legacy = path.join(ctx.CONTENT, 'cheatsheet.md')
  if (!files.length && fs.existsSync(legacy)) files.push('../cheatsheet.md')

  const parsed = files
    .map((name) => {
      const file = name === '../cheatsheet.md' ? legacy : path.join(dir, name)
      const raw = fs.readFileSync(file, 'utf8')
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
      const meta = m ? yaml.load(m[1]) || {} : {}
      const body = m ? m[2] : raw
      const course = ctx.courseById.get(meta.course) || {
        id: meta.course || name.replace('.md', ''),
        name: meta.title || name,
      }
      const html = ctx.renderMarkdown(body, { errors: ctx.errors })
      const groups = (html.match(/<h[23][ >]/g) || []).length
      const terms = Array.isArray(meta.terms) && meta.terms.length ? meta.terms : ['midterm', 'final']
      return {
        id: course.id,
        courseName: course.name,
        title: meta.title || course.name,
        file: name,
        html,
        groups,
        terms,
      }
    })
    .filter((s) => s.html.trim())

  if (!parsed.length) return

  // 按课程聚合；同一门课的多个文件按文件名顺序拼接
  const order = ctx.courses.map((c) => c.id)
  // 同一门课多个文件时，基础版（无 -extra）排在期末补充之前
  parsed.sort((a, b) => {
    const ea = /-extra\.md$/i.test(a.file || '') ? 1 : 0
    const eb = /-extra\.md$/i.test(b.file || '') ? 1 : 0
    return ea - eb
  })

  const byCourse = new Map()
  for (const s of parsed) {
    const entry = byCourse.get(s.id) || { id: s.id, name: s.courseName, parts: [] }
    entry.parts.push(s)
    byCourse.set(s.id, entry)
  }
  const courses = [...byCourse.values()].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))

  const partHtml = (entry, term) =>
    entry.parts
      .filter((p) => p.terms.includes(term))
      .map((p) => p.html)
      .join('\n')

  const totalGroups = parsed.reduce((n, s) => n + s.groups, 0)

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { label: '速查' }])}
  <header class="pagehead pagehead--wide">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">速查表</h1>
      <div class="pagehead__scope sheet-toolbar">
        <p class="sheet-toolbar__lead">勾选要看的科目；打印时只打印勾上的。</p>
        <div class="sheet-toolbar__actions">
          <div class="sheet-picker" role="group" aria-label="选择科目">
            ${courses
              .map(
                (e) =>
                  `<label class="sheet-picker__item"><input type="checkbox" data-pick="${e.id}" checked> ${esc(e.name)}</label>`,
              )
              .join('')}
          </div>
          <button class="btn btn--red" type="button" id="sheet-print">打印勾选的</button>
        </div>
      </div>
    </div>
  </header>

  ${courses
    .map((entry) => {
      const mid = partHtml(entry, 'midterm')
      const fin = partHtml(entry, 'final')
      return `<section class="sheet-course" data-sheet="${entry.id}" data-term="midterm" ${mid ? '' : 'hidden'} data-ui>
    <h2 class="sheet-course__title">${esc(entry.name)}<span class="sheet-course__tag">期中</span></h2>
    <div class="sheet__body prose">${mid || ''}</div>
  </section>
  <section class="sheet-course" data-sheet="${entry.id}" data-term="final" ${fin ? '' : 'hidden'} data-ui>
    <h2 class="sheet-course__title">${esc(entry.name)}<span class="sheet-course__tag">期末</span></h2>
    <div class="sheet__body prose">${fin || ''}</div>
  </section>`
    })
    .join('')}
</div>
<script>
  ;(() => {
    const boxes = [...document.querySelectorAll('[data-pick]')]
    const btn = document.getElementById('sheet-print')
    if (!btn) return

    const apply = () => {
      const on = new Set(boxes.filter((b) => b.checked).map((b) => b.dataset.pick))
      for (const sec of document.querySelectorAll('.sheet-course')) {
        const courseOn = on.has(sec.dataset.sheet)
        sec.dataset.hidden = courseOn ? '0' : '1'
      }
    }

    for (const b of boxes) b.addEventListener('change', apply)

    // 期中时，只有期末的课（如离散数学1）不参与勾选
    document.addEventListener('term:change', (e) => {
      const term = e.detail ? e.detail.term : document.documentElement.dataset.term
      for (const b of boxes) {
        const sec = document.querySelector('.sheet-course[data-sheet="' + b.dataset.pick + '"]')
        const onlyFinal = sec && sec.dataset.term === 'midterm' && sec.hidden
        b.disabled = term === 'midterm' && onlyFinal
        if (b.disabled) b.checked = false
        else if (!b.dataset.touched) b.checked = true
      }
      apply()
    })

    apply()

    btn.addEventListener('click', () => {
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
      description: `${courses.map((c) => c.name).join('、')}的常用结论速查表，A4 横向三栏，可按科目与轮次打印。`,
      body,
      bodyClass: 'detail',
      navActive: 'cheatsheet',
      head: "<style>@media print { @page { size: A4 landscape; margin: 10mm 10mm 12mm; } .sitehead, .footer, .crumb, .pagehead { display: none !important; } .frame { width: auto; padding: 0; } }</style>",
    }),
  )
}
