import MarkdownIt from 'markdown-it'
import { extractContainers, renderContainer } from './blocks.mjs'
import katex from 'katex'

import { expandShorthands } from './shorthands.mjs'

/**
 * 数学公式解析：支持 \( \) \[ \] $ $ $$ $$ 四种写法。
 * 先把公式切成占位符，再交给 markdown-it 渲染正文，最后把占位符换成 KaTeX 输出。
 * 这样 Markdown 的强调、列表、表格不会误伤公式里的下划线、星号、竖线。
 */

const katexOptions = {
  throwOnError: false,
  strict: false,
  trust: false,
  output: 'htmlAndMathml',
}

export const mdError = { current: null }

function renderMath(tex, display, errors) {
  try {
    return katex.renderToString(expandShorthands(tex).trim(), { ...katexOptions, displayMode: display })
  } catch (err) {
    errors.push({ tex, message: err.message })
    return `<code class="math-error" title="${escapeAttr(err.message)}">${escapeHtml(tex)}</code>`
  }
}

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;')

/**
 * 把一个 Markdown 文本渲染成 HTML。
 * @param {string} src
 * @param {{errors?: Array, linkTargetBlank?: boolean}} opts
 */
export function renderMarkdown(src, opts = {}) {
  const errors = opts.errors || []
  const PH = opts.placeholder || '\uE000'
  const store = []
  let text = String(src)

  const push = (tex, display) => {
    store.push({ tex, display })
    return `${PH}${store.length - 1}\uE001`
  }

  // 区块容器（:::定义 … :::）先抽出来，内部正文稍后递归渲染
  const containerId = Math.random().toString(36).slice(2, 8)
  const extracted = extractContainers(text, PH, containerId)
  text = extracted.text
  const containers = extracted.blocks

  // 代码先行：围栏与行内代码整段保护起来，里面的 $ 不当公式（汇编里的 $3 很常见）
  const codeStore = []
  const CODE_INLINE = '\uE100'
  const CODE_BLOCK = '\uE102'
  const pushInline = (s) => {
    codeStore.push({ html: `<code>${escapeHtml(s)}</code>` })
    return `${CODE_INLINE}${codeStore.length - 1}\uE101`
  }
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, body) => {
    codeStore.push({
      html: `<pre class="code-block"><code class="language-${escapeAttr(lang || 'text')}">${escapeHtml(body.replace(/\n$/, ''))}</code></pre>`,
    })
    return `\n${CODE_BLOCK}${codeStore.length - 1}\uE103\n`
  })
  text = text.replace(/`([^`\n]+)`/g, (m, body) => pushInline(body))

  // 行间公式先行，避免 \[ \] 里的内容被行内规则拆开
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => push(tex, true))
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => push(tex, true))
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => push(tex, false))
  text = text.replace(/(^|[^\\$])\$([^$\n]+?)\$(?!\$)/g, (m, pre, tex) => pre + push(tex, false))

  const md = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: false,
    breaks: false,
  })

  // 标题加锚点 id，并收集成目录
  const headings = opts.headings || null
  let headingSeq = 0
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const inline = tokens[idx + 1]
    const text = inline && inline.type === 'inline' ? inline.content : ''
    headingSeq += 1
    const id = `h-${headingSeq}`
    tokens[idx].attrSet('id', id)
    if (headings && (tokens[idx].tag === 'h2' || tokens[idx].tag === 'h3')) {
      headings.push({
        id,
        level: Number(tokens[idx].tag.slice(1)),
        text: text.replace(/\uE000\d+\uE001/g, '').trim() || '公式',
      })
    }
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href') || ''
    if (/^https?:/i.test(href)) {
      tokens[idx].attrSet('target', '_blank')
      tokens[idx].attrSet('rel', 'noopener noreferrer')
    }
    return self.renderToken(tokens, idx, options)
  }

  // 表格套一层滚动容器：列多的时候在窄屏横向滚动，不撑破正文
  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>'
  md.renderer.rules.table_close = () => '</table></div>'

  let html = md.render(text, opts.env || {})

  // 还原公式
  html = html.replace(/\uE000(\d+)\uE001/g, (_, i) => {
    const { tex, display } = store[Number(i)]
    const out = renderMath(tex, display, errors)
    return display ? `<span class="math-display">${out}</span>` : out
  })

  // 还原代码块
  html = html.replace(/\uE102(\d+)\uE103/g, (_, i) => codeStore[Number(i)].html)
  html = html.replace(
    /(?:<p>|>)?\uE100(\d+)\uE101(?:<\/p>)?/g,
    (m, i) => codeStore[Number(i)].html,
  )

  // 还原区块容器（内部正文再走一遍完整管线）
  if (containers.length) {
    html = html.replace(new RegExp(`(?:<p>)?\\uE200${containerId}(\\d+)\\uE201(?:</p>)?`, 'g'), (m, i) => {
      const block = containers[Number(i)]
      if (!block) return ''
      const inner = renderMarkdown(block.body, { errors, placeholder: PH })
      return renderContainer(block, inner)
    })
  }

  return html
}

/** 抽取正文里的第一个标题，用作列表页的摘要 */
export function firstHeading(src) {
  const m = String(src).match(/^#{2,3}\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

/** 把正文按 ## 标题切块，返回 [{title, level, body}]，用于题目页与笔记页 */
export function splitSections(src) {
  const lines = String(src).split('\n')
  const out = []
  let cur = { title: '', level: 0, body: [] }
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/)
    if (m) {
      out.push(cur)
      cur = { title: m[2], level: m[1].length, body: [] }
    } else {
      cur.body.push(line)
    }
  }
  out.push(cur)
  return out
    .filter((s) => s.title || s.body.join('').trim())
    .map((s) => ({ title: s.title, level: s.level, body: s.body.join('\n').trim() }))
}

export function stripMath(src) {
  return String(src)
    .replace(/\\\[([\s\S]*?)\\\]/g, ' ')
    .replace(/\$\$([\s\S]*?)\$\$/g, ' ')
    .replace(/\\\(([\s\S]*?)\\\)/g, ' ')
    .replace(/\$([^$\n]+?)\$/g, ' ')
}
