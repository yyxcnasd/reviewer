/* 复习册 · 页面脚本。不加载任何外部依赖。 */
;(() => {
  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

  /* ---------------------------------------------------------------- 入场 */

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const revealTargets = [
    '.board__mosaic > *',
    '.board__text > *',
    '.spine__row',
    '.scope__head > *',
    '.checker',
    '.chapter',
    '.pagehead__inner > *',
    '.qpage__stem > *',
    '.qblock',
    '.pager',
    '.qpage__side > *',
    '.filters__field',
    '.article__main > *',
    '.step',
    '.faq__item',
    '.split__body > *',
    '.split__figure',
    '.materials__item',
    '.paper',
    '.practice__card',
    '.submit__form > *',
    '.article__toc',
    '.footer__col',
    '.section > *',
    '.tagcloud a',
    '.practice__filters > *',
    '.callout',
  ]

  // 长列表只给前若干行做入场，其余直接显示，避免整页一起变成 invisible
  const rowLimit = 40
  const listRows = Array.from(document.querySelectorAll('.qlist .qrow'))

  if (!prefersReduced && 'IntersectionObserver' in window) {
    const groups = new Map()
    for (const sel of revealTargets) {
      for (const el of $$(sel)) {
        if (el.dataset.reveal !== undefined) continue
        el.setAttribute('data-reveal', '')
        const parent = el.parentElement
        const list = groups.get(parent) || []
        list.push(el)
        groups.set(parent, list)
      }
    }
    for (const list of groups.values()) {
      list.forEach((el, i) => {
        el.style.setProperty('--delay', `${Math.min(i, 6) * 70}ms`)
      })
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    for (const el of $$('[data-reveal]')) io.observe(el)

    for (const row of listRows.slice(0, rowLimit)) {
      row.setAttribute('data-reveal', '')
      row.style.setProperty('--delay', '0ms')
      io.observe(row)
    }
  }

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

  /* ---------------------------------------------------------------- 考纲判定器 */

  const input = $('#scope-input')
  const verdict = $('#scope-verdict')
  const clearBtn = $('#scope-clear')
  const rows = $$('.spine__row')

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

    const stateWord = (s) =>
      s === 'in' ? '<span class="yes">在期中范围内</span>' : s === 'boundary' ? '<span class="yes">在范围内，到此为止</span>' : '<span class="no">不在期中范围</span>'

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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
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
      q: $('#f-q'),
    }

    const readQuery = () => {
      const p = new URLSearchParams(location.search)
      if (p.get('course') && sel.course) sel.course.value = p.get('course')
      if (p.get('chapter') && sel.chapter) sel.chapter.value = p.get('chapter')
      if (p.get('tag') && sel.tag) sel.tag.value = p.get('tag')
      if (p.get('difficulty') && sel.difficulty) sel.difficulty.value = p.get('difficulty')
      if (p.get('q') && sel.q) sel.q.value = p.get('q')
    }

    const run = () => {
      const course = sel.course?.value || ''
      const chapter = sel.chapter?.value || ''
      const tag = sel.tag?.value || ''
      const difficulty = sel.difficulty?.value || ''
      const q = (sel.q?.value || '').trim().toLowerCase()
      let shown = 0
      for (const item of items) {
        const ok =
          (!course || item.dataset.course === course) &&
          (!chapter || item.dataset.chapter === chapter) &&
          (!difficulty || item.dataset.difficulty === difficulty) &&
          (!tag || (item.dataset.tags || '').split(' ').includes(tag)) &&
          (!q || (item.dataset.text || '').toLowerCase().includes(q))
        item.hidden = !ok
        if (ok) shown += 1
      }
      if (countEl) countEl.textContent = String(shown)
      if (emptyEl) emptyEl.hidden = shown !== 0
    }

    readQuery()
    for (const el of Object.values(sel)) {
      if (el) el.addEventListener('input', run)
      if (el) el.addEventListener('change', run)
    }
    run()
  }
})()
