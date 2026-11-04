/* 由 src/shorthands.mjs 生成，别手改。展开规则与构建时完全一致。 */
;(() => {
  const SIMPLE = [
    ["\\eps", "\\varepsilon"],
    ["\\rank", "\\operatorname{rank}"],
    ["\\tr", "\\operatorname{tr}"],
    ["\\diag", "\\operatorname{diag}"],
    ["\\sgn", "\\operatorname{sgn}"],
    ["\\e", "\\mathrm{e}"],
    ["\\d", "\\mathrm{d}"],
    ["\\i", "\\mathrm{i}"],
    ["\\R", "\\mathbb{R}"],
    ["\\N", "\\mathbb{N}"],
    ["\\Z", "\\mathbb{Z}"],
    ["\\Q", "\\mathbb{Q}"],
    ["\\C", "\\mathbb{C}"],
    ["\\T", "^{\\mathrm{T}}"],
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
      out = expandBraced(out, '\\abs', '\\left|', '\\right|')
      out = expandBraced(out, '\\norm', '\\left\\|', '\\right\\|')
      if (out === before) break
    }
    for (const [short, long] of SIMPLE) {
      const re = new RegExp(short.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g')
      out = out.replace(re, long)
    }
    return out
  }

  window.RBExpandShorthands = expand
})()
