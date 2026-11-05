(function () {

const ALIASES = {
  // 数学类
  definition: { label: '定义', tone: '定义' },
  theorem: { label: '定理', tone: '定理' },
  lemma: { label: '引理', tone: '定理' },
  proposition: { label: '命题', tone: '定理' },
  corollary: { label: '推论', tone: '推论' },
  property: { label: '性质', tone: '性质' },
  conclusion: { label: '结论', tone: '结论' },
  example: { label: '例', tone: '例' },
  proof: { label: '证明', tone: '证明' },

  // 提示类
  note: { label: '注意', tone: '注意' },
  warning: { label: '注意', tone: '注意' },
  warn: { label: '注意', tone: '注意' },
  danger: { label: '注意', tone: '注意' },
  caution: { label: '注意', tone: '注意' },
  important: { label: '注意', tone: '注意' },
  tip: { label: '提示', tone: '提示' },
  info: { label: '提示', tone: '提示' },
  remark: { label: '备注', tone: '提示' },
}

const OPEN = /^:::\s*([^\s:：\[]+)\s*(?:\[([^\]]*)\])?\s*(.*)$/
const CLOSE = /^:::\s*$/

function isContainerKind(word) {
  return Object.prototype.hasOwnProperty.call(ALIASES, word)
}

function kindOf(word) {
  return ALIASES[word] || null
}

/**
 * 把 ::: 容器抽成占位符，返回 { text, blocks }
 * blocks[i] = { label, tone, title, body }
 */
function extractContainers(src, ph, id) {
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
function renderContainer(block, innerHtml) {
  const tone = block.tone
  const label = block.label
  const title = block.title || ''
  const head = title
    ? `<span class="nb__label">${label}</span><span class="nb__title">${title}</span>`
    : `<span class="nb__label">${label}</span>`
  return `<div class="nb nb--${tone}"><p class="nb__head">${head}</p>${innerHtml}</div>`
}

window.RBBlocks = { extractContainers, renderContainer }
})()