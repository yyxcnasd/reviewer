import MarkdownIt from 'markdown-it'
import katex from 'katex'

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
    return katex.renderToString(tex.trim(), { ...katexOptions, displayMode: display })
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
    if (headings && tokens[idx].tag === 'h2') {
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

  let html = md.render(text, opts.env || {})

  // 还原公式
  html = html.replace(/\uE000(\d+)\uE001/g, (_, i) => {
    const { tex, display } = store[Number(i)]
    const out = renderMath(tex, display, errors)
    return display ? `<span class="math-display">${out}</span>` : out
  })

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
