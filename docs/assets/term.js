/* 考试轮次：期中 / 期末。开关在导航上，选择记在本地。
   DOM 里每个带 data-states 的元素都写着自己的 {"midterm":"in","final":"out"}，
   切换时只改类和文字，不重新渲染。 */
;(() => {
  const KEY = 'reviewer.term'
  const root = document.documentElement
  const buttons = Array.from(document.querySelectorAll('[data-term-btn]'))
  const LABEL = { in: '在范围内', boundary: '止于此处', partial: '部分在范围', out: '不在本轮范围' }
  const DEFAULT = buttons[0]?.dataset.termBtn || 'midterm'

  function currentTerm() {
    return root.getAttribute('data-term') || DEFAULT
  }

  function statesOf(el) {
    try {
      return JSON.parse(el.dataset.states || '{}')
    } catch {
      return {}
    }
  }

  /* 把一个元素按当前轮次的状态写上类 */
  function paint(el) {
    const states = statesOf(el)
    const state = states[currentTerm()] || 'out'
    el.dataset.state = state
    if (el.matches('.range tr, .chapter, .qrow')) {
      el.classList.toggle('is-out', state === 'out')
      el.classList.toggle('is-boundary', state === 'boundary' || state === 'partial')
      // 题目行：不在本轮范围的，把标记露出来
      const badge = el.querySelector('.qrow__term')
      if (badge) badge.hidden = state !== 'out'
    }
    if (el.matches('[data-sec]')) {
      el.classList.toggle('sec-in', state === 'in')
      el.classList.toggle('sec-boundary', state === 'boundary')
      el.classList.toggle('sec-out', state === 'out')
    }
    if (el.hasAttribute('data-chip')) {
      const chip = el.matches('[data-chip]') ? el : el.querySelector('[data-chip]')
      if (chip) {
        chip.textContent = LABEL[state]
        chip.classList.toggle('chip--in', state === 'in')
        chip.classList.toggle('chip--boundary', state === 'boundary')
        chip.classList.toggle('chip--out', state === 'out')
      }
    }
    return state
  }

  function apply(term, persist = true) {
    root.setAttribute('data-term', term)
    for (const el of document.querySelectorAll('[data-states]')) paint(el)
    for (const btn of buttons) btn.classList.toggle('is-on', btn.dataset.termBtn === term)
    // 首页范围表：只留下当前轮次开考的课程
    for (const block of document.querySelectorAll('[data-course-terms]')) {
      const own = (block.dataset.courseTerms || '').split(/\s+/).filter(Boolean)
      block.hidden = own.length > 0 && !own.includes(term)
    }
    const termName = (document.querySelector('.term-btn.is-on') || {}).textContent || ''
    for (const el of document.querySelectorAll('[data-term-name]')) el.textContent = termName.trim()
    const label = buttons.find((b) => b.dataset.termBtn === term)?.textContent?.trim() || term
    for (const el of document.querySelectorAll('[data-term-label]')) el.textContent = label
    // 题库里如果有「范围」筛选，切轮次后重算
    document.dispatchEvent(new CustomEvent('term:change', { detail: { term } }))
    if (persist) {
      try {
        localStorage.setItem(KEY, term)
      } catch (e) {
        /* ignore */
      }
    }
  }

  // 初值：链接参数 > 本地记录 > 第一个轮次
  let initial = DEFAULT
  try {
    const forced = new URLSearchParams(location.search).get('term')
    const saved = localStorage.getItem(KEY)
    const valid = (t) => t === 'midterm' || t === 'final'
    if (valid(forced)) initial = forced
    else if (valid(saved)) initial = saved
  } catch (e) {
    /* ignore */
  }

  for (const btn of buttons) {
    btn.addEventListener('click', () => apply(btn.dataset.termBtn))
  }

  // 没有开关的页面（导出、打印页）也要按轮次渲染
  apply(initial, false)

  window.Term = { current: currentTerm, apply, label: LABEL }
})()
