#!/usr/bin/env node
/**
 * 把一条投稿 issue 的正文变成一个题目文件。
 *
 *   node scripts/issue-to-question.mjs --body issue.md              # 预览
 *   node scripts/issue-to-question.mjs --body issue.md --write      # 写文件
 *   node scripts/issue-to-question.mjs --issue 42 --write           # 用 gh 拉 issue 正文
 *
 * 正文可以是站里投稿页生成的整段 Markdown，也可以是 issue 表单的
 * 「### 题面」这种分节格式，两种都认。
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const args = process.argv.slice(2)
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] ?? true : fallback
}
const flag = (name) => args.includes(`--${name}`)

const COURSE_DEFAULT_CHAPTER = { va1: 'va1-4', la: 'la-3' }
const LABEL_MAP = {
  微积分: 'va1',
  微积分a1: 'va1',
  va1: 'va1',
  线性代数: 'la',
  la: 'la',
}

function readBody() {
  const bodyFile = opt('body')
  if (bodyFile) return fs.readFileSync(bodyFile, 'utf8')
  const issue = opt('issue')
  if (issue) {
    return execFileSync('gh', ['issue', 'view', String(issue), '--json', 'body', '-q', '.body'], {
      encoding: 'utf8',
    })
  }
  return fs.readFileSync(0, 'utf8')
}

/** issue 表单格式（### 字段名 + 内容）→ 对象 */
function parseFormBody(text) {
  const out = {}
  const re = /^###\s+(.+?)\s*\n([\s\S]*?)(?=\n###\s|\s*$)/gm
  let m
  while ((m = re.exec(text))) {
    out[m[1].trim()] = m[2].trim()
  }
  return out
}

/** frontmatter 格式（站里投稿页生成的）→ 对象 + 正文 */
function parseFrontmatterBody(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return null
  try {
    return { data: yaml.load(m[1]) || {}, body: m[2] }
  } catch {
    return null
  }
}

function normaliseCourse(value) {
  const key = String(value || '')
    .toLowerCase()
    .replace(/[\s()（）]/g, '')
  for (const [k, v] of Object.entries(LABEL_MAP)) if (key.includes(k)) return v
  return 'va1'
}

function normaliseChapter(value, course) {
  const s = String(value || '')
  const id = s.match(/(va1-\d|la-\d)/)
  if (id) return id[1]
  return COURSE_DEFAULT_CHAPTER[course]
}

function normaliseDifficulty(value) {
  const n = Number(String(value || '').match(/[1-4]/)?.[0])
  return Number.isFinite(n) ? n : 2
}

function normaliseKind(value) {
  const s = String(value || '')
  for (const k of ['计算题', '证明题', '概念题', '综合题']) if (s.includes(k)) return k
  return '计算题'
}

function splitSections(text) {
  const parts = text.split(/\n(?=##\s)/)
  const stem = (parts.shift() || '').trim()
  const sections = {}
  for (const part of parts) {
    const m = part.match(/^##\s+(.+?)\s*\n([\s\S]*)$/)
    if (m) sections[m[1].trim()] = m[2].trim()
  }
  return { stem, sections }
}

function main() {
  const raw = readBody()
  const fm = parseFrontmatterBody(raw)
  const form = parseFormBody(raw)

  let course, chapter, tags, difficulty, kind, stem, hint, solution, answer, mistakes, origin

  if (fm) {
    course = normaliseCourse(fm.data.course)
    chapter = normaliseChapter(fm.data.chapter, course)
    tags = Array.isArray(fm.data.tags) ? fm.data.tags : String(fm.data.tags || '').split(/[,，]/)
    difficulty = normaliseDifficulty(fm.data.difficulty)
    kind = normaliseKind(fm.data.kind)
    answer = fm.data.answer || ''
    origin = fm.data.origin || ''
    const sec = splitSections(fm.body)
    stem = sec.stem
    hint = sec.sections['提示'] || ''
    solution = sec.sections['解析'] || ''
    mistakes = sec.sections['常见错误'] || ''
  } else {
    const pick = (...names) => {
      for (const name of names) {
        if (form[name]) return form[name]
        const key = Object.keys(form).find((k) => k.startsWith(name) || name.startsWith(k))
        if (key) return form[key]
      }
      return ''
    }
    course = normaliseCourse(pick('课程'))
    chapter = normaliseChapter(pick('章节'), course)
    tags = String(pick('标签') || '')
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter(Boolean)
    difficulty = normaliseDifficulty(pick('难度'))
    kind = normaliseKind(pick('题型'))
    const unusable = (v) => !v || /^_no response_$/i.test(String(v).trim())
    const get = (...names) => { const v = pick(...names); return unusable(v) ? '' : v }
    stem = get('题面')
    hint = get('提示')
    solution = get('解析')
    answer = get('答案')
    mistakes = get('常见错误')
    origin = get('署名')
  }

  if (!stem) {
    console.error('没找到题面。用 --body 传一个文件，或者确认 issue 正文里有「### 题面」一节。')
    process.exit(2)
  }
  if (!solution) {
    console.error('没找到解析。投稿必须有解析，否则不进题库。')
    process.exit(2)
  }

  const dir = path.join(ROOT, 'content', 'questions', course)
  fs.mkdirSync(dir, { recursive: true })
  const numbers = fs
    .readdirSync(dir)
    .map((f) => Number(String(f).match(/-(\d+)\.md$/)?.[1]))
    .filter(Number.isFinite)
  const next = String(Math.max(0, ...numbers) + 1).padStart(3, '0')
  const id = `${course}-${next}`
  const file = path.join(dir, `${id}.md`)

  const front = [
    '---',
    `course: ${course}`,
    `chapter: ${chapter}`,
    `tags: [${tags.join(', ')}]`,
    `difficulty: ${difficulty}`,
    `kind: ${kind}`,
    'source: 投稿',
  ]
  if (answer) front.push(`answer: ${answer}`)
  if (origin) front.push(`origin: ${origin}`)
  front.push('---')

  const bodyParts = [stem.trim()]
  if (hint) bodyParts.push(`## 提示\n\n${hint.trim()}`)
  bodyParts.push(`## 解析\n\n${solution.trim()}`)
  if (mistakes) bodyParts.push(`## 常见错误\n\n${mistakes.trim()}`)

  const text = `${front.join('\n')}\n\n${bodyParts.join('\n\n')}\n`

  console.log(`\n${path.relative(ROOT, file)}`)
  console.log('─'.repeat(60))
  console.log(text)
  console.log('─'.repeat(60))

  if (flag('write')) {
    if (fs.existsSync(file)) {
      console.error(`${path.relative(ROOT, file)} 已经存在，没有覆盖。`)
      process.exit(3)
    }
    fs.writeFileSync(file, text, 'utf8')
    console.log(`已写入 ${path.relative(ROOT, file)}`)
    console.log('下一步：node build.mjs --check-only 确认无误，再提交 PR。')
  } else {
    console.log('（预览；加 --write 才会写文件）')
  }
}

main()
