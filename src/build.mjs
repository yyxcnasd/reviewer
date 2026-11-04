/**
 * 站点组装：把内容模型变成 docs/ 下的静态站点。
 * 页面本身在 src/pages/*.mjs，这里只负责顺序、共享上下文和静态资源。
 */
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

import { buildHome } from './pages/home.mjs'
import { buildCourses } from './pages/courses.mjs'
import { buildNotes } from './pages/notes.mjs'
import { buildQuestionIndex, buildQuestionPages } from './pages/questions.mjs'
import { buildTagPages } from './pages/tags.mjs'
import { buildCheatsheet } from './pages/cheatsheet.mjs'
import { buildPractice } from './pages/practice.mjs'
import { buildSubmit } from './pages/submit.mjs'
import { buildAbout } from './pages/about.mjs'
import { buildNotation } from './pages/notation.mjs'
import { buildStats } from './pages/stats.mjs'
import { browserSource } from './shorthands.mjs'
import { buildExportPages } from './pages/export.mjs'
import { buildNotFound, buildData, buildExtras } from './pages/extras.mjs'

/** CSS 的拼接顺序（fonts.css 由字体脚本生成，排在最前） */
const STYLE_ORDER = ['tokens', 'base', 'home', 'pages-browse', 'pages-tools', 'pages-detail', 'pages-misc', 'practical']

/** 页面脚本：都是普通 <script>，按顺序拷到 assets/ */
const SCRIPTS = ['core.js', 'theme.js', 'term.js', 'progress.js', 'site.js', 'submit.js', 'practice.js', 'export.js', 'export-print.js']

/** 建索引：题目按课程/章节分组，给各页面直接用 */
export function prepare(ctx) {
  const { questions, courses, chapterById } = ctx
  const order = new Map()
  let i = 0
  for (const c of courses) for (const ch of c.chapters) order.set(ch.id, i++)

  ctx.qByCourse = new Map()
  ctx.qByChapter = new Map()
  for (const q of questions) {
    if (!ctx.qByCourse.has(q.course)) ctx.qByCourse.set(q.course, [])
    ctx.qByCourse.get(q.course).push(q)
    if (!ctx.qByChapter.has(q.chapter)) ctx.qByChapter.set(q.chapter, [])
    ctx.qByChapter.get(q.chapter).push(q)
  }

  ctx.notesByChapter = new Map(ctx.notes.map((n) => [n.id, n]))

  ctx.tagCounts = new Map()
  for (const q of questions) for (const t of q.tags) ctx.tagCounts.set(t, (ctx.tagCounts.get(t) || 0) + 1)

  for (const ch of chapterById.values()) {
    ch.count = (ctx.qByChapter.get(ch.id) || []).length
    ch.note = ctx.notesByChapter.get(ch.id)
    ch.order = order.get(ch.id)
  }
}

export async function buildSite(ctx) {
  ctx.written = []
  prepare(ctx)

  buildHome(ctx)
  buildCourses(ctx)
  buildNotes(ctx)
  buildQuestionIndex(ctx)
  buildQuestionPages(ctx)
  buildTagPages(ctx)
  buildCheatsheet(ctx)
  buildExportPages(ctx)
  buildPractice(ctx)
  buildSubmit(ctx)
  buildAbout(ctx)
  buildNotation(ctx)
  buildStats(ctx)
  buildNotFound(ctx)

  buildData(ctx)
  buildExtras(ctx)
  copyStatic(ctx)
  cleanStale(ctx)
}

/* ---------------------------------------------------------------- 静态资源 */

export function copyStatic(ctx) {
  copyDir(path.join(ctx.ROOT, 'src/assets/photos'), path.join(ctx.OUT, 'assets/photos'))
  copyDir(path.join(ctx.ROOT, 'src/assets/vendor'), path.join(ctx.OUT, 'assets/vendor'))
  copyDir(path.join(ctx.ROOT, 'src/assets/fonts'), path.join(ctx.OUT, 'assets/fonts'))

  // KaTeX 的样式与字体（与站点 CSS 分开，只在需要公式的页面加载）
  const katexDist = path.join(ctx.ROOT, 'node_modules/katex/dist')
  if (fs.existsSync(katexDist)) {
    const out = path.join(ctx.OUT, 'assets/katex')
    fs.mkdirSync(out, { recursive: true })
    fs.copyFileSync(path.join(katexDist, 'katex.min.css'), path.join(out, 'katex.min.css'))
    copyDir(path.join(katexDist, 'fonts'), path.join(out, 'fonts'))
  }

  // 站点样式：按顺序拼成一个文件，少几次请求
  const stylesDir = path.join(ctx.ROOT, 'src/styles')
  const fontsCssPath = path.join(stylesDir, 'fonts.css')
  const parts = [fs.existsSync(fontsCssPath) ? fs.readFileSync(fontsCssPath, 'utf8') : '']
  for (const name of STYLE_ORDER) {
    const file = path.join(stylesDir, `${name}.css`)
    if (fs.existsSync(file)) parts.push(fs.readFileSync(file, 'utf8'))
  }
  fs.mkdirSync(path.join(ctx.OUT, 'assets'), { recursive: true })
  fs.writeFileSync(path.join(ctx.OUT, 'assets/site.css'), parts.join('\n'), 'utf8')

  // 打印版单独一份（只有 /export/print/ 用）
  const sheetCss = path.join(stylesDir, 'print-sheet.css')
  if (fs.existsSync(sheetCss)) fs.copyFileSync(sheetCss, path.join(ctx.OUT, 'assets/print-sheet.css'))

  // 缩写展开器（投稿页预览用），与构建时同一份规则
  fs.writeFileSync(path.join(ctx.OUT, 'assets/shorthands.js'), browserSource(), 'utf8')

  for (const name of SCRIPTS) {
    const file = path.join(ctx.ROOT, 'src/assets', name)
    if (fs.existsSync(file)) fs.copyFileSync(file, path.join(ctx.OUT, 'assets', name))
  }
}

export function copyDir(src, dst) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dst, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dst, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

/** 删掉 docs 里这次没有重新生成的页面，避免改名/下线后留下旧 URL */
export function cleanStale(ctx) {
  const keep = new Set(ctx.written.map((w) => path.resolve(ctx.OUT, w)))
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(abs)
        if (fs.readdirSync(abs).length === 0) fs.rmdirSync(abs)
        continue
      }
      if (!entry.name.endsWith('.html')) continue
      if (keep.has(path.resolve(abs))) continue
      // 顶层 404 与 data/ 里的 json 不在 written 里，别误删
      if (entry.name === '404.html') continue
      fs.unlinkSync(abs)
      console.log('  清理旧页面', path.relative(ctx.ROOT, abs).replace(/\\/g, '/'))
    }
  }
  if (fs.existsSync(ctx.OUT)) walk(ctx.OUT)

  // data/q 里的题目 JSON 同理
  const qDir = path.join(ctx.OUT, 'data/q')
  if (fs.existsSync(qDir)) {
    const live = new Set(ctx.questions.map((q) => q.id + '.json'))
    for (const f of fs.readdirSync(qDir)) {
      if (!live.has(f)) {
        fs.unlinkSync(path.join(qDir, f))
        console.log('  清理旧题目', f)
      }
    }
  }
}
