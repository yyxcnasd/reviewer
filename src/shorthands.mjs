/**
 * TeX 缩写：写题时用短写，构建时展开成标准 TeX。
 *
 * 设计原则
 * - 只在公式里展开（\( \) \[ \] $ $$ 内部），正文里的反斜杠不动。
 * - 缩写后面不能紧跟字母：\e 是 e，\exp 还是 exp。
 * - 展开结果用 \mathrm 让 e / d / i 这类常数与算子站正，这是数学排版的老规矩：
 *   变量斜体、常数与算子正体，否则 e^x 和「变量 e 的 x 次方」分不清。
 */

export const SHORTHANDS = [
  { key: '\\e', tex: '\\mathrm{e}', note: '自然常数 e，正体' },
  { key: '\\d', tex: '\\mathrm{d}', note: '微分算子 d，正体' },
  { key: '\\i', tex: '\\mathrm{i}', note: '虚数单位 i，正体' },
  { key: '\\R', tex: '\\mathbb{R}', note: '实数集' },
  { key: '\\N', tex: '\\mathbb{N}', note: '自然数集' },
  { key: '\\Z', tex: '\\mathbb{Z}', note: '整数集' },
  { key: '\\Q', tex: '\\mathbb{Q}', note: '有理数集' },
  { key: '\\C', tex: '\\mathbb{C}', note: '复数集' },
  { key: '\\eps', tex: '\\varepsilon', note: 'ε（常用的一版）' },
  { key: '\\abs{…}', tex: '\\left|…\\right|', note: '绝对值' },
  { key: '\\norm{…}', tex: '\\left\\|…\\right\\|', note: '范数' },
  { key: '\\rank', tex: '\\operatorname{rank}', note: '秩' },
  { key: '\\tr', tex: '\\operatorname{tr}', note: '迹' },
  { key: '\\diag', tex: '\\operatorname{diag}', note: '对角矩阵' },
  { key: '\\sgn', tex: '\\operatorname{sgn}', note: '符号函数' },
  { key: '\\T', tex: '^{\\mathrm{T}}', note: '转置，写在矩阵右上角' },
]

/** 会展开的「无参数」缩写；后面紧跟字母时不算 */
const SIMPLE = [
  ['\\abs', '\\left|', '\\right|'],
  ['\\norm', '\\left\\|', '\\right\\|'],
  ['\\eps', '\\varepsilon'],
  ['\\rank', '\\operatorname{rank}'],
  ['\\tr', '\\operatorname{tr}'],
  ['\\diag', '\\operatorname{diag}'],
  ['\\sgn', '\\operatorname{sgn}'],
  ['\\e', '\\mathrm{e}'],
  ['\\d', '\\mathrm{d}'],
  ['\\i', '\\mathrm{i}'],
  ['\\R', '\\mathbb{R}'],
  ['\\N', '\\mathbb{N}'],
  ['\\Z', '\\mathbb{Z}'],
  ['\\Q', '\\mathbb{Q}'],
  ['\\C', '\\mathbb{C}'],
  ['\\T', '^{\\mathrm{T}}'],
]

/** \abs{...} / \norm{...}：括号配对地替换 */
function expandBraced(tex, name, open, close) {
  let i = 0
  let out = ''
  while (i < tex.length) {
    const at = tex.indexOf(name, i)
    if (at < 0) {
      out += tex.slice(i)
      break
    }
    // 后面必须是 {，否则原样保留
    if (tex[at + name.length] !== '{') {
      out += tex.slice(i, at + name.length)
      i = at + name.length
      continue
    }
    let depth = 0
    let j = at + name.length
    for (; j < tex.length; j += 1) {
      const ch = tex[j]
      if (ch === '{') depth += 1
      else if (ch === '}') {
        depth -= 1
        if (depth === 0) break
      }
    }
    if (j >= tex.length) {
      // 括号没闭合：不展开，交给 KaTeX 报错
      out += tex.slice(i)
      break
    }
    const inner = tex.slice(at + name.length + 1, j)
    out += tex.slice(i, at) + open + inner + close
    i = j + 1
  }
  return out
}

/** 展开一段公式。只处理公式内部，调用方负责切分。 */
export function expandShorthands(tex) {
  let out = String(tex)
  // 括号里可能套括号，多过几遍直到稳定（最多 4 遍，防止死循环）
  for (let pass = 0; pass < 4; pass += 1) {
    const before = out
    out = expandBraced(out, '\\abs', '\\left|', '\\right|')
    out = expandBraced(out, '\\norm', '\\left\\|', '\\right\\|')
    if (out === before) break
  }
  for (const [short, long] of SIMPLE) {
    if (short === '\\abs' || short === '\\norm') continue
    // 后面不能紧跟字母（\e 与 \exp、\d 与 \det 的区别）
    const re = new RegExp(`${short.replace(/\\/g, '\\\\')}(?![a-zA-Z])`, 'g')
    out = out.replace(re, long)
  }
  return out
}

/** 统计一段公式里用到的缩写（给投稿页做提示用） */
export function usedShorthands(tex) {
  return SHORTHANDS.filter((s) => String(tex).includes(s.key.replace('{…}', ''))).map((s) => s.key)
}

/**
 * 生成浏览器端用的版本（投稿页预览要和支持的写法一致）。
 * 构建时写到 docs/assets/shorthands.js，逻辑和上面同一个来源。
 */
export function browserSource() {
  const simple = SIMPLE.filter(([k]) => k !== '\\abs' && k !== '\\norm')
    .map(([k, v]) => `    [${JSON.stringify(k)}, ${JSON.stringify(v)}],`)
    .join('\n')
  return `/* 由 src/shorthands.mjs 生成，别手改。展开规则与构建时完全一致。 */
;(() => {
  const SIMPLE = [
${simple}
  ]

  function expandBraced(tex, name, open, close) {
    let i = 0
    let out = ''
    while (i < tex.length) {
      const at = tex.indexOf(name, i)
      if (at < 0) {
        out += tex.slice(i)
        break
      }
      if (tex[at + name.length] !== '{') {
        out += tex.slice(i, at + name.length)
        i = at + name.length
        continue
      }
      let depth = 0
      let j = at + name.length
      for (; j < tex.length; j += 1) {
        if (tex[j] === '{') depth += 1
        else if (tex[j] === '}') {
          depth -= 1
          if (depth === 0) break
        }
      }
      if (j >= tex.length) {
        out += tex.slice(i)
        break
      }
      out += tex.slice(i, at) + open + tex.slice(at + name.length + 1, j) + close
      i = j + 1
    }
    return out
  }

  function expand(tex) {
    let out = String(tex)
    for (let pass = 0; pass < 4; pass += 1) {
      const before = out
      out = expandBraced(out, '\\\\abs', '\\\\left|', '\\\\right|')
      out = expandBraced(out, '\\\\norm', '\\\\left\\\\|', '\\\\right\\\\|')
      if (out === before) break
    }
    for (const [short, long] of SIMPLE) {
      const re = new RegExp(short.replace(/\\\\/g, '\\\\\\\\') + '(?![a-zA-Z])', 'g')
      out = out.replace(re, long)
    }
    return out
  }

  window.RBExpandShorthands = expand
})()
`
}
