/* 投稿页：写 Markdown、实时预览、生成 issue 与文件
   编辑器要点：
   - 工具条用 execCommand('insertText')，所以 Ctrl+Z 能撤销按钮插进去的文字
   - 括号 / $ / 反引号自动配对，Tab 跳出
   - Ctrl+B / Ctrl+I 包住选中内容（一次撤销） */
;(() => {
  const { $ } = window.RB
  const form = $('#submit-form')
  if (!form) return

  const repo = form.dataset.repo || 'your-github-name/reviewer'
  const el = {
    category: $('#s-category'),
    course: $('#s-course'),
    chapter: $('#s-chapter'),
    tags: $('#s-tags'),
    difficulty: $('#s-difficulty'),
    kind: $('#s-kind'),
    origin: $('#s-origin'),
    stem: $('#s-stem'),
    hint: $('#s-hint'),
    solution: $('#s-solution'),
    answer: $('#s-answer'),
    mistakes: $('#s-mistakes'),
    preview: $('#preview'),
    file: $('#p-file'),
    fm: $('#p-frontmatter'),
    status: $('#s-status'),
  }

  const CHAPTERS = window.__CHAPTERS__ || {}
  const AREAS = Array.from(el.stem ? document.querySelectorAll('textarea') : [])
  const ALL = [el.stem, el.hint, el.solution, el.answer, el.mistakes].filter(Boolean)

  /* ---------------------------------------------------------------- 分类联动 */

  function chaptersFor(course) {
    return CHAPTERS[course] || ''
  }

  function syncChapter() {
    const course = el.course.value
    const html = chaptersFor(course)
    if (!course || !html) {
      el.chapter.innerHTML = '<option value="">—</option>'
      el.chapter.disabled = true
      return
    }
    el.chapter.innerHTML = '<option value="">不指定章节</option>' + html
    el.chapter.disabled = false
  }

  el.course.addEventListener('change', () => {
    syncChapter()
    update()
  })
  el.category.addEventListener('change', () => {
    // 大分类选「其他」时，课程留空更自然
    if (el.category.options[el.category.selectedIndex]?.textContent.trim() === '其他') {
      el.course.value = ''
      syncChapter()
    }
    update()
  })
  syncChapter()

  /* ---------------------------------------------------------------- 渲染 */

  const md = window.markdownit({ html: false, linkify: false, typographer: false })
  const TOKEN = (i) => `\uE000${i}\uE001`

  function renderMath(src) {
    const store = []
    const push = (tex, display) => {
      store.push({ tex, display })
      return TOKEN(store.length - 1)
    }
    let text = src
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, t) => push(t, true))
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, t) => push(t, true))
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, t) => push(t, false))
    text = text.replace(/(^|[^\\$])\$([^$\n]+?)\$(?!\$)/g, (m, pre, t) => pre + push(t, false))
    let html = md.render(text)
    html = html.replace(/\uE000(\d+)\uE001/g, (_, i) => {
      const item = store[Number(i)]
      if (!item) return ''
      try {
        return window.katex.renderToString(item.tex.trim(), {
          displayMode: item.display,
          throwOnError: false,
          output: 'htmlAndMathml',
        })
      } catch (e) {
        return `<code class="math-error">${item.tex.replace(/[<>&]/g, '')}</code>`
      }
    })
    return html
  }

  const tags = () =>
    el.tags.value
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter(Boolean)

  function courseId() {
    return el.course.value || 'other'
  }

  function chapterId() {
    return el.chapter.value || (el.course.value ? '' : 'other-1')
  }

  function buildFrontmatter() {
    const lines = ['---']
    lines.push(`course: ${courseId()}`)
    const ch = chapterId()
    if (ch) lines.push(`chapter: ${ch}`)
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

  const buildMarkdown = () => `${buildFrontmatter()}\n\n${buildBody()}\n`

  /* 文件名：按已有题号顺延（其他类的是 other-001） */
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
    const course = courseId()
    const n = nextIds && nextIds[course] ? nextIds[course] + 1 : 1
    return `content/questions/${course}/${course}-${String(n).padStart(3, '0')}.md`
  }

  /* ---------------------------------------------------------------- 预览 */

  let timer = 0
  function update() {
    const stem = el.stem.value.trim()
    const sol = el.solution.value.trim()
    let html = ''
    if (stem) html += renderMath(stem)
    if (el.hint.value.trim())
      html += `<details class="qblock qblock--hint"><summary>提示</summary><div class="qblock__body">${renderMath(el.hint.value)}</div></details>`
    if (sol)
      html += `<details class="qblock" open><summary>解析</summary><div class="qblock__body">${renderMath(sol)}</div></details>`
    if (el.answer.value.trim())
      html += `<div class="answer"><span>答案</span>${renderMath(el.answer.value)}</div>`
    if (el.mistakes.value.trim())
      html += `<details class="qblock"><summary>常见错误</summary><div class="qblock__body">${renderMath(el.mistakes.value)}</div></details>`

    el.preview.innerHTML =
      html ||
      '<p class="hint">左边写题面，这里会同步显示排版后的样子。行内公式用 \\( \\)，独立公式用 \\[ \\]。</p>'

    const file = suggestedFile()
    el.file.textContent = file
    if (el.fm) el.fm.textContent = buildFrontmatter()

    const problems = []
    if (!stem) problems.push('题面还没写')
    if (!sol) problems.push('解析还没写')
    if (!tags().length) problems.push('至少一个标签')
    el.status.textContent = problems.length ? `还差：${problems.join('、')}` : '可以提交了。'
    el.status.classList.toggle('is-warn', problems.length > 0)
  }

  for (const area of ALL) {
    area.addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(update, 120)
    })
  }
  for (const key of ['difficulty', 'kind', 'tags', 'origin', 'chapter']) {
    el[key].addEventListener('change', update)
    el[key].addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(update, 120)
    })
  }

  /* ---------------------------------------------------------------- 编辑器工具 */

  /** 用 execCommand 插入，保证进浏览器原生的撤销栈 */
  function insert(area, text, selectFrom, selectTo) {
    area.focus()
    if (selectFrom !== undefined) area.setSelectionRange(selectFrom, selectTo ?? selectFrom)
    if (!document.execCommand('insertText', false, text)) {
      // 老浏览器兜底（撤销栈会丢，但至少能输入）
      const { selectionStart: s, selectionEnd: e, value } = area
      area.value = value.slice(0, s) + text + value.slice(e)
      area.setSelectionRange(s + text.length, s + text.length)
    }
    update()
  }

  /** 用 before/after 包住选区；一次插入，所以一次能撤销 */
  function wrap(area, before, after, placeholder) {
    const s = area.selectionStart ?? area.value.length
    const e = area.selectionEnd ?? s
    const selected = area.value.slice(s, e) || placeholder || ''
    area.focus()
    area.setSelectionRange(s, e)
    insert(area, before + selected + after, s, e)
    const from = s + before.length
    area.setSelectionRange(from, from + selected.length)
  }

  const ACTIONS = {
    bold: (a) => wrap(a, '**', '**', '加粗'),
    italic: (a) => wrap(a, '*', '*', '斜体'),
    code: (a) => wrap(a, '`', '`', 'code'),
    math: (a) => wrap(a, '\\(', '\\)', 'x'),
    display: (a) => wrap(a, '\\[\n', '\n\\]', 'x'),
    list: (a) => {
      const s = a.selectionStart ?? 0
      const lineStart = a.value.lastIndexOf('\n', s - 1) + 1
      insert(a, '- ', lineStart)
    },
    quote: (a) => {
      const s = a.selectionStart ?? 0
      const lineStart = a.value.lastIndexOf('\n', s - 1) + 1
      insert(a, '> ', lineStart)
    },
    heading: (a) => {
      const s = a.selectionStart ?? 0
      const lineStart = a.value.lastIndexOf('\n', s - 1) + 1
      insert(a, '## ', lineStart)
    },
  }

  let lastArea = el.stem
  for (const area of ALL) {
    area.addEventListener('focus', () => {
      lastArea = area
    })
  }

  for (const btn of document.querySelectorAll('[data-md]')) {
    // mousedown 阻止默认，避免点按钮时输入框失焦
    btn.addEventListener('mousedown', (ev) => ev.preventDefault())
    btn.addEventListener('click', () => {
      const fn = ACTIONS[btn.dataset.md]
      if (fn) fn(lastArea || el.stem)
    })
  }

  /* 自动配对 + Tab 跳出 + 快捷键 */
  const PAIRS = {
    '(': ')',
    '[': ']',
    '（': '）',
    '《': '》',
    '\u201c': '\u201d',
    $: '$',
    '`': '`',
  }
  const CLOSERS = new Set([')', ']', '）', '》', '$', '`', '\u201d'])

  for (const area of ALL) {
    area.addEventListener('keydown', (ev) => {
      const s = area.selectionStart
      const e = area.selectionEnd
      const value = area.value
      const hasSel = e > s

      // Ctrl/Cmd + B / I
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey) {
        const key = ev.key.toLowerCase()
        if (key === 'b') {
          ev.preventDefault()
          ACTIONS.bold(area)
          return
        }
        if (key === 'i') {
          ev.preventDefault()
          ACTIONS.italic(area)
          return
        }
        if (key === 'e') {
          ev.preventDefault()
          ACTIONS.code(area)
          return
        }
      }

      // Tab：后面正好是右括号就跳过去，否则插两个空格
      if (ev.key === 'Tab' && !ev.shiftKey) {
        const next = value[s]
        if (!hasSel && next && CLOSERS.has(next)) {
          ev.preventDefault()
          area.setSelectionRange(s + 1, s + 1)
          return
        }
        if (!hasSel) {
          ev.preventDefault()
          insert(area, '  ', s, s)
          return
        }
      }

      // 自动配对
      const closer = PAIRS[ev.key]
      if (!closer || ev.ctrlKey || ev.metaKey || ev.altKey) return
      // 有选中内容：把选区包起来，一次撤销
      if (hasSel) {
        ev.preventDefault()
        wrap(area, ev.key, closer)
        return
      }
      // `$` 后面紧跟数字时（如 $x$ 里的 $），不配对
      const next = value[s] || ''
      if (next && /[\w\u4e00-\u9fff]/.test(next)) return
      ev.preventDefault()
      insert(area, ev.key + closer, s, s)
      const pos = s + 1
      area.setSelectionRange(pos, pos)
    })

    // 敲右括号时，如果已经存在就只移动光标
    area.addEventListener('beforeinput', (ev) => {
      if (ev.inputType !== 'insertText' || !ev.data || ev.data.length !== 1) return
      if (!CLOSERS.has(ev.data)) return
      const s = area.selectionStart
      if (area.selectionEnd !== s) return
      if (area.value[s] !== ev.data) return
      ev.preventDefault()
      area.setSelectionRange(s + 1, s + 1)
      update()
    })
  }

  /* ---------------------------------------------------------------- 动作 */

  $('#s-issue').addEventListener('click', () => {
    const markdown = buildMarkdown()
    const chapterText = el.chapter.value
      ? el.chapter.options[el.chapter.selectedIndex].textContent.trim()
      : '其他'
    const title = `[题目投稿] ${chapterText} · ${el.kind.value}`
    const body = `${markdown}\n\n---\n建议文件：\`${suggestedFile()}\``
    const link = `https://github.com/${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=question-submission`
    if (link.length > 7500) {
      el.status.textContent = `题目太长，issue 链接放不下（${link.length} 字符）。请用「下载 .md」，把文件贴进 issue 或直接交给管理员。`
      el.status.classList.add('is-warn')
      return
    }
    window.open(link, '_blank', 'noopener')
    el.status.textContent = '已在新标签页打开 GitHub issue 表单。'
    el.status.classList.remove('is-warn')
  })

  $('#s-download').addEventListener('click', () => {
    const markdown = buildMarkdown()
    const name = suggestedFile().split('/').pop()
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
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
    const ok = await window.RB.copy(buildMarkdown())
    el.status.textContent = ok ? '已复制整份 Markdown（含 frontmatter）。' : '浏览器不让写剪贴板，请用「下载 .md」。'
    el.status.classList.toggle('is-warn', !ok)
  })

  $('#s-reset').addEventListener('click', () => {
    for (const k of ['stem', 'hint', 'solution', 'answer', 'mistakes', 'tags', 'origin']) el[k].value = ''
    update()
  })

  update()
})()
