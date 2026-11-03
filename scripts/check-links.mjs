#!/usr/bin/env node
/**
 * 检查生成出来的站点里的内部链接与资源是否都存在。
 * GitHub Pages 上放到仓库子路径（/repo-name/）时，任何写死的绝对路径都会挂，
 * 所以这里按「文件相对路径」解析，模拟子路径部署。
 *
 *   node scripts/check-links.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SITE = path.join(ROOT, 'docs')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

const pages = walk(SITE)
const missing = new Map()
const absolute = new Map()
let checked = 0

const decode = (s) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8')
  const from = path.dirname(page)
  const refs = []
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) refs.push(m[1])
  for (const m of html.matchAll(/content="([^"]+)"/g)) {
    if (m[1].startsWith('http')) continue
  }
  for (const raw of refs) {
    if (!raw || raw.startsWith('#')) continue
    if (/^(https?:|mailto:|javascript:|data:)/i.test(raw)) {
      continue
    }
    if (raw.startsWith('/')) {
      absolute.set(path.relative(ROOT, page), raw)
      continue
    }
    const clean = decode(raw.split('#')[0].split('?')[0])
    if (!clean) continue
    checked += 1
    let target = path.resolve(from, clean)
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html')
    if (!fs.existsSync(target)) {
      const key = `${path.relative(ROOT, page)} → ${raw}`
      missing.set(key, target)
    }
  }
}

if (absolute.size) {
  console.log(`\n绝对路径（子路径部署会挂，${absolute.size} 处）：`)
  for (const [page, raw] of [...absolute].slice(0, 20)) console.log(`  ${page}: ${raw}`)
}

if (missing.size) {
  console.log(`\n断链（${missing.size} 处）：`)
  for (const [ref, target] of [...missing].slice(0, 40)) {
    console.log(`  ${ref}`)
  }
  process.exit(1)
}

console.log(`检查了 ${pages.length} 个页面、${checked} 个内部链接与资源，全部存在。`)
