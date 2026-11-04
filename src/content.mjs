/**
 * 读取并校验 content/ 下的所有内容，返回给页面生成用的上下文。
 * 校验失败不抛错，而是把问题收集到 err/warn 里，由 CLI 决定怎么报告。
 */
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

import { renderMarkdown, splitSections, stripMath } from './markdown.mjs'

export const KINDS = new Set(['计算题', '证明题', '概念题', '综合题'])
export const DIFFICULTY_LABEL = { 1: '基础', 2: '常规', 3: '综合', 4: '挑战' }

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const readYAML = (p) => yaml.load(fs.readFileSync(p, 'utf8'))

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else if (entry.name.endsWith('.md')) out.push(p)
  }
  return out
}

function parseFrontmatter(src, file, err) {
  const m = String(src).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) {
    err(file, '缺少 frontmatter（文件开头需要有 --- 包起来的字段块）')
    return { data: {}, body: String(src) }
  }
  try {
    return { data: yaml.load(m[1]) || {}, body: m[2] }
  } catch (e) {
    err(file, `frontmatter 不是合法的 YAML：${e.message}`)
    return { data: {}, body: m[2] }
  }
}

/** 从题面第一句里取一个短标题（列表页、搜索结果用） */
function makeTitle(stem, q) {
  const plain = stripMath(stem).replace(/[#>*`|]/g, '').replace(/\s+/g, ' ').trim()
  const firstSentence = plain.split(/[。？；]/)[0] || plain
  const t = firstSentence.slice(0, 42)
  return t.length < 4 ? `${q.kind}：${q.tags[0] || '数学'}` : t
}

export function loadContent({ ROOT, err, warn }) {
  const CONTENT = path.join(ROOT, 'content')
  const config = readJSON(path.join(ROOT, 'site.config.json'))
  const coursesDoc = readYAML(path.join(CONTENT, 'courses.yml'))
  const taxonomy = readYAML(path.join(CONTENT, 'taxonomy.yml'))

  const terms = coursesDoc.terms || [{ id: 'midterm', label: '期中' }]
  const termIds = terms.map((t) => t.id)
  const stateOf = (states) =>
    states.includes('in') ? 'in' : states.includes('boundary') ? 'boundary' : 'out'

  const allTermIds = termIds
  const courses = coursesDoc.courses.map((course) => {
    // 课程级 terms：不写就表示期中期末都有；离散数学只写了 [final]
    const own = Array.isArray(course.terms) && course.terms.length ? course.terms : allTermIds
    const chapters = course.chapters.map((ch) => {
      // 每个小节：terms 里没写的轮次按 state 兜底
      const sections = (ch.sections || []).map((s) => {
        const termsOfSection = {}
        for (const id of termIds) {
          termsOfSection[id] = own.includes(id) ? s.terms?.[id] || s.state || 'out' : 'out'
        }
        return { ...s, terms: termsOfSection, state: stateOf(Object.values(termsOfSection)) }
      })
      const chapterTerms = {}
      for (const id of termIds) {
        if (!own.includes(id)) {
          chapterTerms[id] = 'out'
          continue
        }
        chapterTerms[id] = sections.length
          ? stateOf(sections.map((s) => s.terms[id]))
          : ch.terms?.[id] || ch.state || 'in'
      }
      return { ...ch, course: course.id, terms: chapterTerms, sections, state: stateOf(Object.values(chapterTerms)) }
    })
    return { ...course, terms: own, chapters }
  })

  const courseById = new Map(courses.map((c) => [c.id, c]))
  // 章节只存一份：prepare() 会往上面挂 count / note，课程页与题目页都要看到
  const chapterById = new Map()
  for (const c of courses) for (const ch of c.chapters) {
    ch.courseId = c.id
    chapterById.set(ch.id, ch)
  }
  const categoryById = new Map(taxonomy.categories.map((c) => [c.id, c]))
  const knownTags = new Set(taxonomy.tags || [])
  const defaultCategory = (course) =>
    course === 'va1' ? 'calculus' : course === 'la' ? 'linear-algebra' : 'other'

  /* ---------------- 题目 ---------------- */

  const questions = []
  const usedTags = new Map()

  for (const file of walk(path.join(CONTENT, 'questions'))) {
    const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'), file, err)
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

    if (!courseById.has(q.course)) err(file, `course 必须是 ${[...courseById.keys()].join(' / ')}，当前是 ${q.course}`)
    if (!q.chapter) err(file, '缺少 chapter')
    else if (!chapterById.has(q.chapter)) err(file, `chapter「${q.chapter}」不在 courses.yml 里`)
    else if (chapterById.get(q.chapter).courseId !== q.course)
      err(file, `chapter「${q.chapter}」属于 ${chapterById.get(q.chapter).courseId}，和 course「${q.course}」不一致`)

    q.category = q.category || categoryById.get(defaultCategory(q.course))?.id
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
    q.stem = parts.find((p) => !p.title && p.body)?.body || ''
    q.solution = parts.filter((p) => /解/.test(p.title)).map((p) => p.body).join('\n\n')
    q.hint = parts.filter((p) => /提示/.test(p.title)).map((p) => p.body).join('\n\n')
    q.mistakes = parts.filter((p) => /错误|易错/.test(p.title)).map((p) => p.body).join('\n\n')

    if (!q.stem.trim()) err(file, '找不到题面：正文开头（第一个 ## 之前）就是题面')
    if (!q.solution.trim()) err(file, '缺少「## 解析」一节')
    if (q.kind === '计算题' && !q.answer) warn(file, '计算题建议在 frontmatter 里写 answer')

    q.searchText = stripMath(`${q.stem} ${q.tags.join(' ')} ${q.source}`).replace(/\s+/g, ' ').slice(0, 400)
    q.title = makeTitle(q.stem, q)
    questions.push(q)
  }

  // 公式校验：整段渲染一遍，KaTeX 的报错记到对应文件上
  for (const q of questions) {
    const collected = []
    renderMarkdown(`${q.stem}\n\n${q.hint}\n\n${q.solution}\n\n${q.mistakes}`, { errors: collected })
    for (const e of collected) err(q.file, `公式写错了：${e.message || e}`)
  }

  questions.sort((a, b) => (a.course === b.course ? a.id.localeCompare(b.id) : a.course.localeCompare(b.course)))

  /* ---------------- 复习要点 ---------------- */

  const notes = []
  for (const file of walk(path.join(CONTENT, 'notes'))) {
    const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'), file, err)
    const fileId = path.basename(file, '.md')
    const ch = chapterById.get(data.chapter || fileId)
    if (!ch) {
      err(file, `chapter「${data.chapter || fileId}」不在 courses.yml 里`)
      continue
    }
    if (!data.title) err(file, '缺少 title')
    if (!body.trim()) err(file, '正文是空的')
    notes.push({
      file,
      id: ch.id,
      chapter: ch,
      course: courseById.get(ch.courseId),
      title: data.title || ch.title,
      lead: data.lead || '',
      body,
      parts: splitSections(body),
      html: renderMarkdown(body, { errors: [] }),
    })
  }
  // 只对「有题」的章节要求要点：空分类（比如「其他」）没题就不用写
  const chaptersWithQuestions = new Set(questions.map((q) => q.chapter))
  for (const ch of chapterById.values()) {
    if (ch.state === 'in' && chaptersWithQuestions.has(ch.id) && !notes.some((n) => n.id === ch.id)) {
      warn(path.join(CONTENT, 'notes'), `章节「${ch.title}」还没有复习要点文件（content/notes/${ch.courseId}/${ch.id}.md）`)
    }
  }

  /* ---------------- 部署前提醒 ---------------- */

  if (String(config.repo).startsWith('your-github-name')) {
    warn(
      path.join(ROOT, 'site.config.json'),
      'repo 还是占位符（your-github-name/reviewer）：投稿页的 issue 按钮会指向不存在的仓库，部署前把它改成你自己的 owner/repo',
    )
  }

  const stats = {
    questions: questions.length,
    byCourse: Object.fromEntries(courses.map((c) => [c.id, questions.filter((q) => q.course === c.id).length])),
    notes: notes.length,
  }

  return {
    ROOT,
    terms,
    OUT: path.join(ROOT, 'docs'),
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
    KINDS,
    DIFFICULTY_LABEL,
    renderMarkdown,
    warn,
    errors: [],
  }
}
