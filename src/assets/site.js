/* 复习册 · 页面脚本。不加载任何外部依赖。 */
;(() => {
  const { $, $$, escapeHtml } = window.RB

  /* 内容一律直接可见：不做“滚动到才出现”的动画 */

  /* 首屏两个圆由 CSS 动画展开，脚本不再插手 */

  /* 样张：图片从左边拉开，同时红圈圈上 */
  const plate = $('#plate')
  const ring = $('#ring')
  if (plate && ring) {
    if (prefersReduced) {
      plate.classList.add('is-in')
      ring.classList.add('is-in')
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            plate.classList.add('is-in')
            ring.classList.add('is-in')
            io.disconnect()
          }
        },
        { threshold: 0.25 },
      )
      io.observe(plate)
    }
  }

  /* ---------------------------------------------------------------- 三条结论 */

  const tabs = $$('[role="tab"]')
  if (tabs.length) {
    const activate = (tab) => {
      for (const t of tabs) {
        const on = t === tab
        t.setAttribute('aria-selected', String(on))
        const panel = document.getElementById(t.getAttribute('aria-controls'))
        if (panel) panel.hidden = !on
      }
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab))
      tab.addEventListener('keydown', (ev) => {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return
        ev.preventDefault()
        const next = tabs[(i + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
        next.focus()
        activate(next)
      })
    })
  }

  /* ---------------------------------------------------------------- 题目页：展开、复制、键盘翻页 */

  const pager = document.querySelector('[data-pager]')
  if (pager) {
    const details = Array.from(document.querySelectorAll('.qblock'))
    const expandBtn = document.getElementById('expand-all')
    if (expandBtn && details.length) {
      let open = false
      expandBtn.addEventListener('click', () => {
        open = !open
        for (const d of details) d.open = open
        expandBtn.textContent = open ? '收起解析与提示' : '展开解析与提示'
      })
    }

    const copyBtn = document.getElementById('copy-md')
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const stem = document.querySelector('.qpage__stem')
        const solution = document.querySelector('#solution .qblock__body')
        const title = document.querySelector('.qpage__title')?.textContent || ''
        const text = `${title}\n\n${stem ? stem.innerText.trim() : ''}\n\n—— 解析 ——\n${solution ? solution.innerText.trim() : ''}\n\n（来自复习册 ${location.href}）`
        try {
          await navigator.clipboard.writeText(text)
          copyBtn.textContent = '已复制'
          setTimeout(() => (copyBtn.textContent = '复制题目'), 1600)
        } catch {
          copyBtn.textContent = '复制失败'
          setTimeout(() => (copyBtn.textContent = '复制题目'), 1600)
        }
      })
    }

    document.addEventListener('keydown', (ev) => {
      const t2 = ev.target
      if (t2 instanceof Element && t2.matches('input, textarea, select')) return
      const prev = pager.querySelector('.pager__prev[href]')
      const next = pager.querySelector('.pager__next[href]')
      if (ev.key === 'ArrowLeft' && prev) location.href = prev.getAttribute('href')
      else if (ev.key === 'ArrowRight' && next) location.href = next.getAttribute('href')
      else if (ev.key === 'e' || ev.key === 'E') {
        const s = document.getElementById('solution')
        if (s) s.open = !s.open
      } else if (ev.key === 'd' || ev.key === 'D') {
        document.querySelector('.qactions [data-flag="done"]')?.click()
      }
    })
  }

  /* ---------------------------------------------------------------- 考纲判定器 */

  const input = $('#scope-input')
  const verdict = $('#scope-verdict')
  const clearBtn = $('#scope-clear')
  const rows = $$('.spine__row').length ? $$('.spine__row') : $$('.range tr[data-chapter]')

  if (input && verdict) {
    const scopeUrl = document.documentElement.dataset.scope || 'data/scope.json'
    let entries = []

    fetch(scopeUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        for (const course of data.courses) {
          for (const ch of course.chapters) {
            for (const sec of ch.sections) {
              for (const kw of sec.keywords) {
                entries.push({
                  kw: String(kw).toLowerCase(),
                  course: course.short,
                  chTitle: ch.title,
                  chId: ch.id,
                  href: ch.href,
                  chState: ch.state,
                  sec: `${sec.no} ${sec.title}`,
                  state: sec.state,
                })
              }
            }
          }
        }
      })
      .catch(() => {})

      const termLabel = () => document.querySelector('.term-btn.is-on')?.textContent?.trim() || '期中'
      const stateWord = (s) =>
        s === 'in'
          ? '<span class="yes">在' + termLabel() + '范围内</span>'
          : s === 'boundary'
            ? '<span class="yes">在' + termLabel() + '范围内，到此为止</span>'
            : '<span class="no">不在' + termLabel() + '范围</span>'

    const apply = (raw) => {
      const q = raw.trim().toLowerCase().replace(/\s+/g, '')
      for (const r of rows) r.classList.remove('is-hit', 'is-dim')
      if (!q) {
        verdict.innerHTML = '输入之后，这里会告诉你在不在期中范围内。'
        return
      }
      let best = null
      for (const e of entries) {
        const hit = e.kw.includes(q) || q.includes(e.kw)
        if (!hit) continue
        if (!best || e.kw.length > best.kw.length) best = e
      }
      if (!best) {
        verdict.innerHTML = `没找到「${escapeHtml(raw.trim())}」。试试章节名或更常见的说法，比如「导数」「行列式」「极值」。`
        for (const r of rows) r.classList.add('is-dim')
        return
      }
      const chRow = rows.find((r) => r.dataset.chapter === best.chId)
      for (const r of rows) {
        if (r === chRow) r.classList.add('is-hit')
        else r.classList.add('is-dim')
      }
      verdict.innerHTML = `「${escapeHtml(raw.trim())}」落在 <b>${escapeHtml(best.sec)}</b>（${escapeHtml(best.course)} · ${escapeHtml(best.chTitle)}）：${stateWord(best.state)}。${
        best.state === 'out' ? '这一节期中不考，先放着。' : `<a href="${best.href}">去看这一章 →</a>`
      }`
    }

    let timer = 0
    input.addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(() => apply(input.value), 90)
    })
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        apply(input.value)
      }
    })
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = ''
        apply('')
        input.focus()
      })
    }
    for (const chip of $$('[data-try]')) {
      chip.addEventListener('click', () => {
        input.value = chip.dataset.try
        apply(input.value)
      })
    }
  }

  /* ---------------------------------------------------------------- 题库筛选 */

  const filters = $('#filters')
  if (filters) {
    const items = $$('#qlist .qrow')
    const countEl = $('#f-count')
    const emptyEl = $('#qlist-empty')
    const sel = {
      course: $('#f-course'),
      chapter: $('#f-chapter'),
      tag: $('#f-tag'),
      difficulty: $('#f-difficulty'),
      status: $('#f-status'),
      scope: $('#f-scope'),
      sort: $('#f-sort'),
      q: $('#f-q'),
    }
    const list = $('#qlist')
    const order = new Map(items.map((el, i) => [el, i]))

    const readQuery = () => {
      const p = new URLSearchParams(location.search)
      if (p.get('course') && sel.course) sel.course.value = p.get('course')
      if (p.get('chapter') && sel.chapter) sel.chapter.value = p.get('chapter')
      if (p.get('tag') && sel.tag) sel.tag.value = p.get('tag')
      if (p.get('difficulty') && sel.difficulty) sel.difficulty.value = p.get('difficulty')
      if (p.get('q') && sel.q) sel.q.value = p.get('q')
      if (p.get('status') && sel.status) sel.status.value = p.get('status')
    if (sel.scope) {
      sel.scope.addEventListener('change', () => {
        try {
          localStorage.setItem('reviewer.bankScope', sel.scope.value)
        } catch (e) {}
      })
    }
    // 地址里明确写了 scope（哪怕是空值）就照它来；否则按上次选择，或默认只显示本轮范围
    if (p.has('scope') && sel.scope) sel.scope.value = p.get('scope') || ''
    else if (sel.scope && !localStorage.getItem('reviewer.bankScope')) sel.scope.value = 'in'
    if (p.get('sort') && sel.sort) sel.sort.value = p.get('sort')
    }

    const P = window.ReviewProgress
    const run = () => {
      const course = sel.course?.value || ''
      const chapter = sel.chapter?.value || ''
      const tag = sel.tag?.value || ''
      const difficulty = sel.difficulty?.value || ''
      const status = sel.status?.value || ''
      const scope = sel.scope?.value || ''
      const q = (sel.q?.value || '').trim().toLowerCase()
      let shown = 0
      for (const item of items) {
        const id = item.dataset.id || ''
        const done = P ? P.isDone(id) : false
        const fav = P ? P.isFav(id) : false
        item.classList.toggle('is-done', done)
        const ok =
          (!course || item.dataset.course === course) &&
          (!chapter || item.dataset.chapter === chapter) &&
          (!difficulty || item.dataset.difficulty === difficulty) &&
          (!tag || (item.dataset.tags || '').split(' ').includes(tag)) &&
          (!status || (status === 'done' ? done : status === 'undone' ? !done : fav)) &&
          (!scope ||
            (scope === 'in'
              ? ['in', 'boundary', 'partial'].includes(item.dataset.state)
              : item.dataset.state === 'out')) &&
          (!q || (item.dataset.text || '').toLowerCase().includes(q))
        item.hidden = !ok
        if (ok) shown += 1
      }
      if (countEl) countEl.textContent = String(shown)
      if (emptyEl) emptyEl.hidden = shown !== 0

      // 排序
      const sort = sel.sort?.value || 'chapter'
      if (list) {
        const sorted = items.slice().sort((a, b) => {
          if (sort === 'easy') return Number(a.dataset.difficulty) - Number(b.dataset.difficulty) || order.get(a) - order.get(b)
          if (sort === 'hard') return Number(b.dataset.difficulty) - Number(a.dataset.difficulty) || order.get(a) - order.get(b)
          return order.get(a) - order.get(b)
        })
        for (const el of sorted) list.appendChild(el)
      }
    }

    // 从当前筛选里随机抽一道
    const randomBtn = $('#f-random')
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        const pool = items.filter((el) => !el.hidden)
        if (!pool.length) return
        const pick = pool[Math.floor(Math.random() * pool.length)]
        const link = pick.querySelector('.qrow__link')
        if (link) location.href = link.getAttribute('href')
      })
    }

    // 导出当前筛选结果
    const exportBtn = $('#f-export')
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const p = new URLSearchParams()
        const map = { course: 'course', chapter: 'chapter', tag: 'tag', difficulty: 'difficulty', q: 'q' }
        for (const [key, param] of Object.entries(map)) {
          const v = sel[key]?.value?.trim()
          if (v) p.set(param, v)
        }
        const status = sel.status?.value
        if (status) p.set('status', status)
        location.href = '../export/?' + p.toString()
      })
    }

    // 范围说明：本轮范围内有多少道
    const scopeNote = document.querySelector('#q-scope-note')
    const paintScopeNote = () => {
      if (!scopeNote) return
      const termLabel = document.querySelector('.term-btn.is-on')?.textContent?.trim() || '期中'
      const inScope = items.filter((el) => el.dataset.state === 'in' || el.dataset.state === 'boundary').length
      scopeNote.textContent = `${termLabel}范围内 ${inScope} 道 · 范围外 ${items.length - inScope} 道（「范围」可改成全部）`
    }
    paintScopeNote()
    document.addEventListener('term:change', paintScopeNote)

    // 进度变了（在别的行点过）就重算：状态筛选要跟着变
    document.addEventListener('progress:change', run)
    // 换轮次后「范围」筛选跟着变
    document.addEventListener('term:change', run)

    // 按 / 直接搜索
    document.addEventListener('keydown', (ev) => {
      const t = ev.target
      if (ev.key !== '/' || (t instanceof Element && t.matches('input, textarea, select'))) return
      ev.preventDefault()
      sel.q?.focus()
    })

    readQuery()
    for (const el of Object.values(sel)) {
      if (el) el.addEventListener('input', run)
      if (el) el.addEventListener('change', run)
    }
    run()
  }
})()
