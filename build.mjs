#!/usr/bin/env node
/**
 * 复习册 — 静态站点生成器
 *
 *   node build.mjs            生成站点到 docs/
 *   node build.mjs --check-only  只校验内容
 *   node build.mjs --serve    生成 + 本地预览（带热重载的简易服务器）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

import { renderMarkdown, splitSections, stripMath } from './src/markdown.mjs'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const CONTENT = path.join(ROOT, 'content')
const OUT = path.join(ROOT, 'docs')
const args = process.argv.slice(2)
const CHECK_ONLY = args.includes('--check-only')
const SERVE = args.includes('--serve')

const errors = []
const warnings = []
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`)
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`)
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/')

// ---------------------------------------------------------------- 读取

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function readYAML(p) {
  return yaml.load(fs.readFileSync(p, 'utf8'))
}

function parseFrontmatter(src, file) {
  const m = String(src).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) {
    err(file, '缺少 frontmatter（文件开头需要有 --- 包起来的字段块）')
    return { data: {}, body: String(src) }
  }
  let data = {}
  try {
    data = yaml.load(m[1]) || {}
  } catch (e) {
    err(file, `frontmatter 不是合法的 YAML：${e.message}`)
  }
  return { data, body: m[2] }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else if (entry.name.endsWith('.md')) out.push(p)
  }
  return out
}

// ---------------------------------------------------------------- 内容模型

const config = readJSON(path.join(ROOT, 'site.config.json'))
const coursesDoc = readYAML(path.join(CONTENT, 'courses.yml'))
const taxonomy = readYAML(path.join(CONTENT, 'taxonomy.yml'))

const courses = coursesDoc.courses.map((c) => ({
  ...c,
  chapters: c.chapters.map((ch) => {
    const sections = ch.sections || []
    const states = sections.map((s) => s.state)
    const state = states.includes('in')
      ? 'in'
      : states.includes('boundary')
        ? 'boundary'
        : 'out'
    return { ...ch, course: c.id, state, sections }
  }),
}))

const courseById = new Map(courses.map((c) => [c.id, c]))
const chapterById = new Map()
for (const c of courses) for (const ch of c.chapters) chapterById.set(ch.id, { ...ch, courseId: c.id })

const categoryById = new Map(taxonomy.categories.map((c) => [c.id, c]))
const knownTags = new Set(taxonomy.tags || [])

const KINDS = new Set(['计算题', '证明题', '概念题', '综合题'])
const DIFFICULTY_LABEL = { 1: '基础', 2: '常规', 3: '综合', 4: '挑战' }

const questionFiles = walk(path.join(CONTENT, 'questions'))
const questions = []
const usedTags = new Map()

for (const file of questionFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  const { data, body } = parseFrontmatter(raw, file)
  const id = path.basename(file, '.md')
  const dirCourse = path.basename(path.dirname(file))
  const q = {
    id,
    file,
    course: data.course || dirCourse,
    chapter: data.chapter,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    difficulty: Number(data.difficulty),
    kind: data.kind,
    source: data.source || '自编',
    origin: data.origin || '',
    answer: data.answer || '',
    body,
  }

  // 校验
  if (!courseById.has(q.course)) err(file, `course 必须是 ${[...courseById.keys()].join(' / ')}，当前是 ${q.course}`)
  if (!q.chapter) err(file, '缺少 chapter')
  else if (!chapterById.has(q.chapter)) err(file, `chapter「${q.chapter}」不在 courses.yml 里`)
  else if (chapterById.get(q.chapter).courseId !== q.course)
    err(file, `chapter「${q.chapter}」属于 ${chapterById.get(q.chapter).courseId}，和 course「${q.course}」不一致`)

  q.category = q.category || categoryById.get(q.course === 'va1' ? 'calculus' : q.course === 'la' ? 'linear-algebra' : 'other')?.id
  if (!categoryById.has(q.category)) err(file, `category「${q.category}」不在 taxonomy.yml 里`)

  if (!q.tags.length) err(file, 'tags 至少写一个')
  if (q.tags.length > 4) warn(file, `tags 超过 4 个（现在 ${q.tags.length} 个），列表页会显得挤`)
  for (const t of q.tags) {
    if (!knownTags.has(t)) warn(file, `标签「${t}」还没有登记在 taxonomy.yml 的 tags 里`)
    usedTags.set(t, (usedTags.get(t) || 0) + 1)
  }

  if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 4)
    err(file, `difficulty 必须是 1–4 的整数，当前是 ${data.difficulty}`)
  if (!KINDS.has(q.kind)) err(file, `kind 必须是 ${[...KINDS].join(' / ')}，当前是 ${q.kind}`)

  const parts = splitSections(body)
  const stem = parts.find((p) => !p.title && p.body)?.body || ''
  const solution = parts.filter((p) => /解/.test(p.title)).map((p) => p.body).join('\n\n')
  const hint = parts.filter((p) => /提示/.test(p.title)).map((p) => p.body).join('\n\n')
  const mistakes = parts.filter((p) => /错误|易错/.test(p.title)).map((p) => p.body).join('\n\n')

  if (!stem.trim()) err(file, '找不到题面：正文开头（第一个 ## 之前）就是题面')
  if (!solution.trim()) err(file, '缺少「## 解析」一节')
  if (q.kind === '计算题' && !q.answer) warn(file, '计算题建议在 frontmatter 里写 answer')

  q.stem = stem
  q.solution = solution
  q.hint = hint
  q.mistakes = mistakes
  q.searchText = stripMath(`${stem} ${q.tags.join(' ')} ${q.source}`).replace(/\s+/g, ' ').slice(0, 400)
  q.title = makeTitle(stem, q)
  questions.push(q)
}

// 题目标题：从题面第一句里取一个短标题（列表页、标签页、搜索结果用）
function makeTitle(stem, q) {
  const plain = stripMath(stem)
    .replace(/[#>*`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const firstSentence = plain.split(/[。？；]/)[0] || plain
  let t = firstSentence.slice(0, 42)
  if (t.length < 4) t = `${q.kind}：${q.tags[0] || '数学'}`
  return t
}

const notesFiles = walk(path.join(CONTENT, 'notes'))
const notes = []
for (const file of notesFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  const { data, body } = parseFrontmatter(raw, file)
  const fileId = path.basename(file, '.md')
  const ch = chapterById.get(data.chapter || fileId)
  if (!ch) {
    err(file, `chapter「${data.chapter || fileId}」不在 courses.yml 里`)
    continue
  }
  if (!data.title) err(file, '缺少 title')
  if (!body.trim()) err(file, '正文是空的')
  const parts = splitSections(body)
  const html = renderMarkdown(body, { errors })
  notes.push({
    file,
    id: ch.id,
    chapter: ch,
    course: courseById.get(ch.courseId),
    title: data.title || ch.title,
    lead: data.lead || '',
    body,
    parts,
    html,
  })
}
for (const ch of chapterById.values()) {
  if (!notes.some((n) => n.id === ch.id)) {
    if (ch.state === 'in') warn(path.join(CONTENT, 'notes'), `章节「${ch.title}」还没有复习要点文件（content/notes/${ch.courseId}/${ch.id}.md）`)
  }
}

// 校验公式：把每段正文都渲染一遍，收集 KaTeX 报错
for (const q of questions) {
  const before = errors.length
  renderMarkdown(`${q.stem}\n\n${q.hint}\n\n${q.solution}\n\n${q.mistakes}`, { errors })
  if (errors.length > before) {
    const msgs = errors.splice(before).map((e) => e.replace(/^[^:]+:\s*/, ''))
    for (const m of msgs) err(q.file, `公式写错了：${m}`)
  }
}

questions.sort((a, b) => (a.course === b.course ? a.id.localeCompare(b.id) : a.course.localeCompare(b.course)))

// 统计
const stats = {
  questions: questions.length,
  byCourse: Object.fromEntries(
    courses.map((c) => [c.id, questions.filter((q) => q.course === c.id).length]),
  ),
  notes: notes.length,
}

// ---------------------------------------------------------------- 报告

function report() {
  const line = '─'.repeat(64)
  if (warnings.length) {
    console.log(`\n注意（${warnings.length}）`)
    for (const w of warnings) console.log('  · ' + w)
  }
  if (errors.length) {
    console.log(`\n错误（${errors.length}）`)
    for (const e of errors) console.log('  × ' + e)
  }
  console.log(`\n${line}`)
  const counts = courses
    .map((c) => `${c.name} ${stats.byCourse[c.id] || 0} 题`)
    .join(' · ')
  console.log(`内容：${counts} · 复习要点 ${stats.notes} 篇`)
  console.log(errors.length ? `检查未通过：${errors.length} 个错误` : '检查通过')
  console.log(line)
}

if (CHECK_ONLY) {
  report()
  process.exit(errors.length ? 1 : 0)
}

if (errors.length) {
  report()
  console.error('\n有错误，已停止生成。修好之后再跑一次 npm run build。')
  process.exit(1)
}

// ---------------------------------------------------------------- 生成

const { buildSite } = await import('./src/pages.mjs')
const ctx = {
  ROOT,
  OUT,
  CONTENT,
  config,
  courses,
  courseById,
  chapterById,
  categoryById,
  taxonomy,
  questions,
  notes,
  stats,
  usedTags,
  DIFFICULTY_LABEL,
  KINDS,
  renderMarkdown,
  warn,
  errors,
}
await buildSite(ctx)
report()
console.log(`\n生成完成 → ${rel(OUT)}/`)

if (SERVE) {
  const { serve } = await import('./src/serve.mjs')
  serve(OUT, 4173)
}
