/**
 * 「区块」语法：定义 / 定理 / 结论 / 例 / 注意 这类内容的容器
 *
 *   :::定义
 *   设 \(f\) 在 \(x_0\) 的某邻域内有定义……
 *   :::
 *
 *   :::例 3.1
 *   ……
 *   :::
 *
 * 也接受英文别名（definition / theorem / example / note / warn / tip）。
 * 这个文件同时给构建（Node）和投稿预览（浏览器）用：构建时把 `export ` 去掉、
 * 包成 window.RBBlocks 即可，逻辑只有这一份。
 */

const ALIASES = {
  // 数学类
  定义: { label: '定义', tone: '定义' },
  定理: { label: '定理', tone: '定理' },
  引理: { label: '引理', tone: '定理' },
  命题: { label: '命题', tone: '定理' },
  推论: { label: '推论', tone: '推论' },
  性质: { label: '性质', tone: '性质' },
  结论: { label: '结论', tone: '结论' },
  例: { label: '例', tone: '例' },
  例题: { label: '例', tone: '例' },
  证明: { label: '证明', tone: '证明' },

  // 提示类
  注意: { label: '注意', tone: '注意' },
  易错: { label: '易错', tone: '注意' },
  警告: { label: '警告', tone: '注意' },
  提示: { label: '提示', tone: '提示' },
  备注: { label: '备注', tone: '提示' },

  // 通用英文类型（:::info[定义] 这种写法）
  info: { label: '提示', tone: '提示' },
  tip: { label: '提示', tone: '提示' },
  note: { label: '注意', tone: '注意' },
  remark: { label: '备注', tone: '提示' },
  warning: { label: '注意', tone: '注意' },
  warn: { label: '注意', tone: '注意' },
  danger: { label: '注意', tone: '注意' },
  caution: { label: '注意', tone: '注意' },
  theorem: { label: '定理', tone: '定理' },
  lemma: { label: '引理', tone: '定理' },
  corollary: { label: '推论', tone: '推论' },
  proposition: { label: '命题', tone: '定理' },
  definition: { label: '定义', tone: '定义' },
  example: { label: '例', tone: '例' },
  proof: { label: '证明', tone: '证明' },
  conclusion: { label: '结论', tone: '结论' },
}

const OPEN = /^:::\s*([^\s:：\[]+)\s*(?:\[([^\]]*)\])?\s*(.*)$/
const CLOSE = /^:::\s*$/

export function isContainerKind(word) {
  return Object.prototype.hasOwnProperty.call(ALIASES, word)
}

export function kindOf(word) {
  return ALIASES[word] || null
}

/**
 * 把 ::: 容器抽成占位符，返回 { text, blocks }
 * blocks[i] = { label, tone, title, body }
 */
export function extractContainers(src, ph, id) {
  const lines = String(src).split('\n')
  const out = []
  const blocks = []
  let i = 0
  const token = (n) => `\uE200${id}${n}\uE201`

  while (i < lines.length) {
    const m = lines[i].match(OPEN)
    const kind = m ? kindOf(m[1]) : null
    if (!kind) {
      out.push(lines[i])
      i += 1
      continue
    }
    // 收集到匹配的 ::: 结束（允许嵌套）
    let depth = 1
    const body = []
    let title = (m[2] || m[3] || '').trim()
    i += 1
    while (i < lines.length) {
      const line = lines[i]
      if (OPEN.test(line) && kindOf(line.match(OPEN)[1])) {
        depth += 1
        body.push(line)
        i += 1
        continue
      }
      if (CLOSE.test(line)) {
        depth -= 1
        i += 1
        if (depth === 0) break
        body.push(line)
        continue
      }
      body.push(line)
      i += 1
    }
    blocks.push({ tone: kind.tone, label: kind.label, title, body: body.join('\n').trim() })
    out.push('', token(blocks.length - 1), '')
  }

  return { text: out.join('\n'), blocks }
}

/** 把渲染好的正文包成区块 HTML */
export function renderContainer(block, innerHtml) {
  const tone = block.tone
  const label = block.label
  const title = block.title || ''
  const head = title
    ? `<span class="nb__label">${label}</span><span class="nb__title">${title}</span>`
    : `<span class="nb__label">${label}</span>`
  return `<div class="nb nb--${tone}"><p class="nb__head">${head}</p>${innerHtml}</div>`
}
