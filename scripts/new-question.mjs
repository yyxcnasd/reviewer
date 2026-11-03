#!/usr/bin/env node
/**
 * 新建一个题目文件（本地写题用，比手抄 frontmatter 快）。
 *
 *   node scripts/new-question.mjs --course va1 --chapter va1-4 --tags 泰勒公式,极限计算
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const args = process.argv.slice(2)
const opt = (name, fallback = '') => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] ?? fallback : fallback
}

const course = opt('course', 'va1')
const chapter = opt('chapter', course === 'la' ? 'la-3' : 'va1-4')
const tags = opt('tags', '待补标签')
  .split(/[,，]/)
  .map((t) => t.trim())
  .filter(Boolean)

const dir = path.join(ROOT, 'content', 'questions', course)
fs.mkdirSync(dir, { recursive: true })
const numbers = fs
  .readdirSync(dir)
  .map((f) => Number(String(f).match(/-(\d+)\.md$/)?.[1]))
  .filter(Number.isFinite)
const id = `${course}-${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`
const file = path.join(dir, `${id}.md`)

const template = `---
course: ${course}
chapter: ${chapter}
tags: [${tags.join(', ')}]
difficulty: 2
kind: 计算题
source: 自编
answer: $0$
---

在这里写题面，公式用 \\\\( \\\\) 和 \\\\[ \\\\]。

## 提示

（可选）一句话的抓手，不要剧透。

## 解析

第一步先说清楚抓什么，再推导。

## 常见错误

（可选）写真实会犯的错。
`

if (fs.existsSync(file)) {
  console.error(`${path.relative(ROOT, file)} 已经存在。`)
  process.exit(1)
}
fs.writeFileSync(file, template, 'utf8')
console.log(`已创建 ${path.relative(ROOT, file)}`)
console.log('写完跑一次：node build.mjs --check-only')
