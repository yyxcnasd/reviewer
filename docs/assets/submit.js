/* 投稿页：写 Markdown、实时预览、生成 issue 与文件 */
;(() => {
  const $ = (s) => document.querySelector(s)
  const form = $('#submit-form')
  if (!form) return

  const repo = form.dataset.repo || 'your-github-name/reviewer'
  const el = {
    course: $('#s-course'),
    chapter: $('#s-chapter'),
    difficulty: $('#s-difficulty'),
    kind: $('#s-kind'),
    category: $('#s-category'),
    origin: $('#s-origin'),
    tags: $('#s-tags'),
    stem: $('#s-stem'),
    hint: $('#s-hint'),
    solution: $('#s-solution'),
    answer: $('#s-answer'),
    mistakes: $('#s-mistakes'),
    preview: $('#preview'),
    file: $('#p-file'),
    status: $('#s-status'),
  }

  const KIND_CHAPTERS = {}
  for (const opt of el.chapter.querySelectorAll('optgroup')) {
    const name = opt.label
    KIND_CHAPTERS[name] = Array.from(opt.querySelectorAll('option')).map((o) => o.value)
  }

  /* ---- Markdown + 公式渲染（与构建脚本同一套规则的最简实现） ---- */
  const md = window.markdownit({ html: false, linkify: false, typographer: false })

  function renderMath(src) {
    const store = []
    const push = (tex, display) => {
      store.push({ tex, display })
      return `\uE000${store.length - 1}\uE001`
    }
    let text = src
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, t) => push(t, true))
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, t) => push(t, true))
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, t) => push(t, false))
    text = text.replace(/(^|[^\\$])\$([^$\n]+?)\$(?!\$)/g, (m, pre, t) => pre + push(t, false))
    let html = md.render(text)
    html = html.replace(/\uE000(\d+)\uE001/g, (_, i) => {
      const { tex, display } = store[Number(i)]
      try {
        return window.katex.renderToString(tex.trim(), {
          displayMode: display,
          throwOnError: false,
          output: 'htmlAndMathml',
        })
      } catch (e) {
        return `<code class="math-error">${tex.replace(/[<>&]/g, '')}</code>`
      }
    })
    return html
  }

  const tags = () =>
    el.tags.value
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter(Boolean)

  function buildFrontmatter() {
    const course = el.course.value
    const lines = ['---', `course: ${course}`, `chapter: ${el.chapter.value}`]
    if (el.category.value) lines.push(`category: ${el.category.value}`)
    const t = tags()
    lines.push(`tags: [${t.join(', ')}]`)
    lines.push(`difficulty: ${el.difficulty.value}`)
    lines.push(`kind: ${el.kind.value}`)
    lines.push('source: 投稿')
    if (el.answer.value.trim()) lines.push(`answer: ${el.answer.value.trim()}`)
    if (el.origin.value.trim()) lines.push(`origin: ${el.origin.value.trim()}`)
    lines.push('---')
    return lines.join('\n')
  }

  function buildBody() {
    const parts = []
    if (el.stem.value.trim()) parts.push(el.stem.value.trim())
    if (el.hint.value.trim()) parts.push(`## 提示\n\n${el.hint.value.trim()}`)
    if (el.solution.value.trim()) parts.push(`## 解析\n\n${el.solution.value.trim()}`)
    if (el.mistakes.value.trim()) parts.push(`## 常见错误\n\n${el.mistakes.value.trim()}`)
    return parts.join('\n\n')
  }

  function buildMarkdown() {
    return `${buildFrontmatter()}\n\n${buildBody()}\n`
  }

  /* 文件名：按已有题号顺延 */
  let nextIds = null
  fetch('../data/questions.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((list) => {
      nextIds = {}
      for (const q of list) {
        const n = Number(String(q.id).split('-').pop())
        if (!Number.isFinite(n)) continue
        nextIds[q.course] = Math.max(nextIds[q.course] || 0, n)
      }
      update()
    })
    .catch(() => {})

  function suggestedFile() {
    const course = el.course.value
    const n = nextIds && nextIds[course] ? nextIds[course] + 1 : 1
    return `content/questions/${course}/${course}-${String(n).padStart(3, '0')}.md`
  }

  /* ---- 预览 ---- */
  let timer = 0
  function update() {
    const stem = el.stem.value.trim()
    const sol = el.solution.value.trim()
    let html = ''
    if (stem) html += renderMath(stem)
    if (el.hint.value.trim()) html += `<details class="qblock qblock--hint"><summary>提示</summary><div class="qblock__body">${renderMath(el.hint.value)}</div></details>`
    if (sol) html += `<details class="qblock" open><summary>解析</summary><div class="qblock__body">${renderMath(sol)}</div></details>`
    if (el.answer.value.trim()) html += `<div class="answer"><span>答案</span>${renderMath(el.answer.value)}</div>`
    if (el.mistakes.value.trim()) html += `<details class="qblock"><summary>常见错误</summary><div class="qblock__body">${renderMath(el.mistakes.value)}</div></details>`
    el.preview.innerHTML = html || '<p class="hint">左边写题面，这里会同步显示排版后的样子。公式用 \\( \\) 写行内，\\[ \\] 写独立成行。</p>'
    el.file.textContent = suggestedFile()
    const t = tags()
    const problems = []
    if (!stem) problems.push('题面还没写')
    if (!sol) problems.push('解析还没写')
    if (!t.length) problems.push('至少一个标签')
    el.status.textContent = problems.length ? `还差：${problems.join('、')}` : '可以提交了。'
    el.status.classList.toggle('is-warn', problems.length > 0)
  }

  for (const key of ['stem', 'hint', 'solution', 'answer', 'mistakes', 'tags', 'origin']) {
    el[key].addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(update, 120)
    })
  }
  for (const key of ['course', 'chapter', 'difficulty', 'kind', 'category']) {
    el[key].addEventListener('change', update)
  }

  /* ---- 公式工具条 ---- */
  for (const btn of document.querySelectorAll('[data-wrap]')) {
    btn.addEventListener('click', () => {
      const wrap = btn.dataset.wrap === 'display' ? ['\\[', '\\]'] : ['\\(', '\\)']
      insertAtCursor(el.stem, `${wrap[0]}`, `${wrap[1]}`)
    })
  }
  for (const btn of document.querySelectorAll('[data-sym]')) {
    btn.addEventListener('click', () => {
      insertAtCursor(el.stem, '\\(' + btn.dataset.sym, '\\)')
    })
  }

  function insertAtCursor(area, before, after) {
    const start = area.selectionStart ?? area.value.length
    const end = area.selectionEnd ?? area.value.length
    const value = area.value
    area.value = value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end)
    area.focus()
    const pos = start + before.length
    area.setSelectionRange(pos, pos)
    update()
  }

  /* ---- 动作 ---- */
  const issueBtn = $('#s-issue')
  issueBtn.addEventListener('click', () => {
    const md = buildMarkdown()
    const title = `[题目投稿] ${el.chapter.options[el.chapter.selectedIndex].textContent.trim()} · ${el.kind.value}`
    const body = `${md}\n\n---\n建议文件：\`${suggestedFile()}\``
    const url = `https://github.com/${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=question-submission`
    if (url.length > 7500) {
      el.status.textContent = `题目太长，issue 链接放不下（${url.length} 字符）。请用「下载 .md 文件」，把文件贴进 issue 或直接交给管理员。`
      el.status.classList.add('is-warn')
      return
    }
    window.open(url, '_blank', 'noopener')
    el.status.textContent = '已在新标签页打开 GitHub issue 表单。'
    el.status.classList.remove('is-warn')
  })

  $('#s-download').addEventListener('click', () => {
    const md = buildMarkdown()
    const name = suggestedFile().split('/').pop()
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    el.status.textContent = `已下载 ${name}，放进 ${suggestedFile().replace(/\/[^/]+$/, '/')} 即可。`
    el.status.classList.remove('is-warn')
  })

  $('#s-copy').addEventListener('click', async () => {
    const md = buildMarkdown()
    try {
      await navigator.clipboard.writeText(md)
      el.status.textContent = '已复制整份 Markdown（含 frontmatter）。'
    } catch (e) {
      el.status.textContent = '浏览器不让写剪贴板，请用「下载 .md 文件」。'
      el.status.classList.add('is-warn')
    }
  })

  $('#s-reset').addEventListener('click', () => {
    for (const k of ['stem', 'hint', 'solution', 'answer', 'mistakes', 'tags', 'origin']) el[k].value = ''
    update()
  })

  update()
})()
