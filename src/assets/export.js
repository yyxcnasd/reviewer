/* 导出选题页：挑题 + 选项 → 打开打印版 */
;(() => {
  const { $, $$, escapeHtml } = window.RB
  const STORE = 'reviewer.export.v1'

  const el = {
    course: $('#ex-course'),
    chapter: $('#ex-chapter'),
    tag: $('#ex-tag'),
    difficulty: $('#ex-difficulty'),
    q: $('#ex-q'),
    list: $('#ex-list'),
    count: $('#ex-count'),
    sum: $('#ex-sum'),
    hint: $('#ex-hint'),
    solution: $('#ex-solution'),
    answer: $('#ex-answer'),
    mistakes: $('#ex-mistakes'),
    newpage: $('#ex-newpage'),
    work: $('#ex-work'),
    meta: $('#ex-meta'),
    size: $('#ex-size'),
    print: $('#ex-print'),
    printSame: $('#ex-print-same'),
    copy: $('#ex-copy'),
    clear: $('#ex-clear'),
  }

  if (window.RB && window.RB.bindCourseChapter) window.RB.bindCourseChapter(el.course, el.chapter)

  let all = []
  let picked = new Set()
  const order = new Map()

  /* ---------- 选项持久化 ---------- */
  const opts = () => ({
    hint: el.hint.checked,
    solution: el.solution.checked,
    answer: el.answer.checked,
    mistakes: el.mistakes.checked,
    newpage: el.newpage.checked,
    work: el.work.checked,
    meta: el.meta.checked,
    size: el.size.value,
  })

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ picked: [...picked], opts: opts() }))
    } catch {
      /* 隐私模式下存不了，不影响使用 */
    }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORE)
      if (!raw) return
      const data = JSON.parse(raw)
      if (Array.isArray(data.picked)) picked = new Set(data.picked)
      const o = data.opts || {}
      el.hint.checked = Boolean(o.hint)
      el.solution.checked = Boolean(o.solution)
      el.answer.checked = Boolean(o.answer)
      el.mistakes.checked = Boolean(o.mistakes)
      el.newpage.checked = Boolean(o.newpage)
      el.work.checked = Boolean(o.work)
      el.meta.checked = o.meta !== false
      if (o.size) el.size.value = o.size
    } catch {
      /* ignore */
    }
  }

  /* ---------- 从链接预设 ---------- */
  function fromQuery() {
    const p = new URLSearchParams(location.search)
    let preset = false
    const ids = (p.get('ids') || '').split(',').filter(Boolean)
    if (ids.length) {
      picked = new Set(ids)
      preset = true
    }
    if (p.get('course')) {
      el.course.value = p.get('course')
      preset = true
    }
    if (p.get('chapter')) {
      el.chapter.value = p.get('chapter')
      preset = true
    }
    if (p.get('tag')) {
      el.tag.value = p.get('tag')
      preset = true
    }
    if (p.get('difficulty')) {
      el.difficulty.value = p.get('difficulty')
      preset = true
    }
    if (p.get('q')) el.q.value = p.get('q')
    // 带筛选参数但没带 ids：把筛选结果全选上
    if (preset && !ids.length) {
      for (const q of filtered()) picked.add(q.id)
    }
    if (p.get('mode') === 'stem') {
      el.solution.checked = false
      el.answer.checked = false
      el.mistakes.checked = false
      el.hint.checked = false
    } else if (p.get('mode') === 'full') {
      el.solution.checked = true
    }
  }

  /* ---------- 过滤 ---------- */
  function filtered() {
    const course = el.course.value
    const chapter = el.chapter.value
    const tag = el.tag.value
    const difficulty = el.difficulty.value
    const text = el.q.value.trim().toLowerCase()
    return all.filter(
      (q) =>
        (!course || q.course === course) &&
        (!chapter || q.chapter === chapter) &&
        (!difficulty || String(q.difficulty) === difficulty) &&
        (!tag || q.tags.includes(tag)) &&
        (!text || (q.text || '').toLowerCase().includes(text)),
    )
  }

  /* ---------- 列表 ---------- */
  function render() {
    const rows = filtered()
    if (!rows.length) {
      el.list.innerHTML = '<p class="hint">这个筛选条件下没有题。</p>'
      updateCount()
      return
    }
    const groups = new Map()
    for (const q of rows) {
      if (!groups.has(q.chapterTitle)) groups.set(q.chapterTitle, [])
      groups.get(q.chapterTitle).push(q)
    }
    el.list.innerHTML = Array.from(groups.entries())
      .map(
        ([chapter, items]) => `<section class="exgroup">
          <header class="exgroup__head">${escapeHtml(chapter)}<span>${items.length} 道</span></header>
          ${items
            .map(
              (q) => `<label class="exrow${picked.has(q.id) ? ' is-picked' : ''}" data-id="${q.id}">
                <input type="checkbox" ${picked.has(q.id) ? 'checked' : ''} data-id="${q.id}">
                <span class="exrow__text">${q.excerptHtml || escapeHtml(q.text || q.id)}</span>
                <span class="exrow__id">${q.id.toUpperCase()} · ${q.difficulty}</span>
              </label>`,
            )
            .join('')}
        </section>`,
      )
      .join('')
    // 前 24 行错开入场，后面不动（长列表不做逐行动画）
    Array.from(el.list.querySelectorAll('.exrow'))
      .slice(0, 24)
      .forEach((row, i) => row.style.setProperty('animation-delay', `${i * 22}ms`))
    updateCount()
  }

  function updateCount() {
    el.count.textContent = String(picked.size)
    const o = opts()
    const bits = ['题面']
    if (o.hint) bits.push('提示')
    if (o.solution) bits.push('解析')
    if (o.answer) bits.push('答案')
    if (o.mistakes) bits.push('常见错误')
    el.sum.innerHTML = `已选 <b>${picked.size}</b> 道 · 包含 ${bits.join(' + ')}${o.newpage ? ' · 每题另起一页' : ''}${
      o.work ? ' · 留答题空间' : ''
    }`
    el.print.disabled = picked.size === 0
    el.printSame.disabled = picked.size === 0
    el.print.textContent = picked.size ? `生成 PDF（${picked.size} 道）` : '生成 PDF'
  }

  /* ---------- 链接 ---------- */
  function printUrl(auto) {
    const p = new URLSearchParams()
    p.set('ids', [...picked].join(','))
    const o = opts()
    if (o.hint) p.set('hint', '1')
    if (o.solution) p.set('solution', '1')
    if (o.answer) p.set('answer', '1')
    if (o.mistakes) p.set('mistakes', '1')
    if (o.newpage) p.set('newpage', '1')
    if (o.work) p.set('work', '1')
    if (o.meta) p.set('meta', '1')
    if (o.size) p.set('size', o.size)
    if (auto) p.set('auto', '1')
    return new URL(`print/?${p.toString()}`, location.href).href
  }

  /* ---------- 事件 ---------- */
  for (const s of [el.course, el.chapter, el.tag, el.difficulty]) {
    s.addEventListener('change', render)
  }
  el.q.addEventListener('input', render)

  el.list.addEventListener('change', (ev) => {
    const input = ev.target
    if (!input.matches('input[type="checkbox"]')) return
    const id = input.dataset.id
    if (input.checked) picked.add(id)
    else picked.delete(id)
    input.closest('.exrow').classList.toggle('is-picked', input.checked)
    updateCount()
    save()
  })

  for (const btn of $$('[data-ex]')) {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.ex
      const rows = filtered()
      if (mode === 'all') for (const q of rows) picked.add(q.id)
      if (mode === 'none') picked.clear()
      if (mode === 'invert') {
        for (const q of rows) {
          if (picked.has(q.id)) picked.delete(q.id)
          else picked.add(q.id)
        }
      }
      render()
      save()
    })
  }

  for (const key of ['hint', 'solution', 'answer', 'mistakes', 'newpage', 'work', 'meta']) {
    el[key].addEventListener('change', () => {
      syncPresets()
      updateCount()
      save()
    })
  }
  el.size.addEventListener('change', () => {
    updateCount()
    save()
  })

  for (const btn of $$('[data-preset]')) {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.preset
      el.hint.checked = mode === 'all'
      el.solution.checked = mode === 'full' || mode === 'all'
      el.answer.checked = mode === 'full' || mode === 'all'
      el.mistakes.checked = mode === 'all'
      syncPresets()
      updateCount()
      save()
    })
  }

  function syncPresets() {
    const o = opts()
    const nothing = !o.hint && !o.solution && !o.answer && !o.mistakes
    const full = !o.hint && o.solution && o.answer && !o.mistakes
    for (const btn of $$('[data-preset]')) {
      const mode = btn.dataset.preset
      const on = (mode === 'stem' && nothing) || (mode === 'full' && full)
      btn.setAttribute('aria-pressed', String(on))
    }
  }

  el.print.addEventListener('click', () => {
    window.open(printUrl(true), '_blank', 'noopener')
  })

  el.printSame.addEventListener('click', () => {
    location.href = printUrl(true)
  })

  el.copy.addEventListener('click', async () => {
    const url = printUrl(false)
    try {
      await navigator.clipboard.writeText(url)
      el.copy.textContent = '链接已复制'
      setTimeout(() => (el.copy.textContent = '复制这个组合的链接'), 1800)
    } catch {
      el.copy.textContent = '复制失败，手动复制地址栏'
      setTimeout(() => (el.copy.textContent = '复制这个组合的链接'), 2200)
    }
  })

  el.clear.addEventListener('click', () => {
    picked.clear()
    render()
    save()
  })

  /* ---------- 启动 ---------- */
  fetch('../data/questions.json')
    .then((r) => r.json())
    .then((list) => {
      all = list
      list.forEach((q, i) => order.set(q.id, i))
      all = list.slice().sort((a, b) => order.get(a.id) - order.get(b.id))
      restore()
      fromQuery()
      render()
      syncPresets()
      updateCount()
    })
    .catch(() => {
      el.list.innerHTML = '<p class="hint">题库没载入。用本地服务器打开预览即可。</p>'
    })
})()
