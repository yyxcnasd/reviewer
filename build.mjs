#!/usr/bin/env node
/**
 * 复习册 — 静态站点生成器
 *
 *   node build.mjs                校验内容并生成到 docs/
 *   node build.mjs --check-only   只校验内容
 *   node build.mjs --serve        生成 + 本地预览 http://localhost:4173/
 *
 * 内容模型在 src/content.mjs，站点组装在 src/build.mjs，页面在 src/pages/。
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadContent } from './src/content.mjs'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const CHECK_ONLY = args.includes('--check-only')
const SERVE = args.includes('--serve')

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/')
const errors = []
const warnings = []
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`)
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`)

const ctx = loadContent({ ROOT, err, warn })
ctx.errors = errors

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
  const counts = ctx.courses.map((c) => `${c.name} ${ctx.stats.byCourse[c.id] || 0} 题`).join(' · ')
  console.log(`\n${line}`)
  console.log(`内容：${counts} · 复习要点 ${ctx.stats.notes} 篇`)
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

const { buildSite } = await import('./src/build.mjs')
await buildSite(ctx)
report()
console.log(`\n生成完成 → ${rel(ctx.OUT)}/`)

if (SERVE) {
  const { serve } = await import('./src/serve.mjs')
  serve(ctx.OUT, 4173)
}
