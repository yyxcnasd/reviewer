/* 复习进度：已做 / 收藏。存在 localStorage，不上传任何东西。 */
;(() => {
  const KEY = 'reviewer.progress.v1'
  const empty = () => ({ done: {}, fav: {} })

  function read() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return empty()
      const data = JSON.parse(raw)
      return {
        done: data && typeof data.done === 'object' && data.done ? data.done : {},
        fav: data && typeof data.fav === 'object' && data.fav ? data.fav : {},
      }
    } catch {
      return empty()
    }
  }

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* 隐私模式写不进去就算了，页面照常用 */
    }
    document.dispatchEvent(new CustomEvent('progress:change', { detail: data }))
  }

  const state = read()

  window.ReviewProgress = {
    state,
    isDone: (id) => Boolean(state.done[id]),
    isFav: (id) => Boolean(state.fav[id]),
    mark(id, kind = 'done', value = true) {
      const bucket = kind === 'done' ? state.done : state.fav
      if (value && !bucket[id]) bucket[id] = Date.now()
      if (!value) delete bucket[id]
      write(state)
      return Boolean(bucket[id])
    },
    toggle(kind, id) {
      const bucket = kind === 'done' ? state.done : state.fav
      if (bucket[id]) delete bucket[id]
      else bucket[id] = Date.now()
      write(state)
      return Boolean(bucket[id])
    },
    counts(total) {
      const done = Object.keys(state.done).length
      const fav = Object.keys(state.fav).length
      return { done, fav, total: typeof total === 'number' ? total : null }
    },
  }

  /* 单个按钮：<button class="flag" data-flag="done" data-id="va1-001"> */
  function sync(btn) {
    const id = btn.dataset.id
    const kind = btn.dataset.flag
    const on = kind === 'done' ? window.ReviewProgress.isDone(id) : window.ReviewProgress.isFav(id)
    btn.setAttribute('aria-pressed', String(on))
    const label = kind === 'done' ? '已做' : '收藏'
    btn.title = on ? `取消${label}` : `标记${label}`
    const text = btn.querySelector('i + span, span')
    if (text) text.textContent = label
  }

  for (const btn of document.querySelectorAll('[data-flag]')) {
    sync(btn)
    btn.addEventListener('click', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      window.ReviewProgress.toggle(btn.dataset.flag, btn.dataset.id)
      sync(btn)
      const row = btn.closest('.qrow')
      if (row) row.classList.toggle('is-done', window.ReviewProgress.isDone(btn.dataset.id))
      updateSummary()
    })
  }

  function updateSummary() {
    const done = Object.keys(state.done).length
    for (const el of document.querySelectorAll('[data-progress-total]')) {
      el.textContent = `${done} / ${Number(el.dataset.progressTotal) || 0}`
    }
    for (const el of document.querySelectorAll('[data-progress-done]')) {
      el.textContent = String(done)
    }
    for (const el of document.querySelectorAll('[data-progress-count]')) {
      el.textContent = String(Object.keys(state.fav).length)
    }
    // 某一组题（题库全集、某一章）里的完成数
    for (const el of document.querySelectorAll('[data-progress-ids]')) {
      const ids = String(el.dataset.progressIds || '').split(',').filter(Boolean)
      const k = ids.filter((id) => state.done[id]).length
      const here = el.querySelector('[data-progress-here]')
      if (here) here.textContent = String(k)
    }
  }

  updateSummary()
  document.addEventListener('progress:change', updateSummary)
})()
