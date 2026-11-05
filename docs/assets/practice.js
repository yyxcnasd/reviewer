/* 刷题：一次一道，先想再看解析 */
;(() => {
  const stage = document.getElementById('stage')
  if (!stage) return
  const { $ } = window.RB

  const el = {
    course: $('#p-course'),
    chapter: $('#p-chapter'),
    difficulty: $('#p-difficulty'),
    order: $('#p-order'),
    status: $('#p-status'),
    apply: $('#p-apply'),
    reveal: $('#p-reveal'),
    next: $('#p-next'),
    open: $('#p-open'),
    index: $('#p-index'),
    total: $('#p-total'),
  }

  let all = []
  let deck = []
  let pos = 0
  let revealed = false

  const shuffle = (arr) => {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  /** 当前轮次（期中 / 期末），term.js 写在 <html data-term> 上 */
  const currentTerm = () => document.documentElement.dataset.term || 'midterm'

  /** 该题在本轮是否可用：in / boundary / partial 都算在范围内 */
  const inScope = (q) => {
    const st = (q.states || {})[currentTerm()]
    return !st || st === 'in' || st === 'boundary' || st === 'partial'
  }



  function build() {
    const course = el.course.value
    const chapter = el.chapter.value
    const difficulty = el.difficulty.value
    const P = window.ReviewProgress
    const status = el.status ? el.status.value : ''
    const filter = (useScope, useStatus) =>
      all.filter((q) => {
        if (useScope && !inScope(q)) return false
        if (course && q.course !== course) return false
        if (chapter && q.chapter !== chapter) return false
        if (difficulty && String(q.difficulty) !== difficulty) return false
        if (useStatus && status === 'undone' && P && P.isDone(q.id)) return false
        if (useStatus && status === 'fav' && P && !P.isFav(q.id)) return false
        return true
      })

    // 依次放宽：范围内且未做 → 范围内 → 全部（避免"随机一题"抽到空列表）
    let list = filter(true, true)
    if (!list.length) list = filter(true, false)
    if (!list.length) list = filter(false, true)
    if (!list.length) list = filter(false, false)

    if (!list.length) {
      stage.innerHTML = '<p class="hint">这个筛选条件下没有题，换个条件试试。</p>'
      el.total.textContent = '0'
      el.index.textContent = '0'
      return
    }
    deck = el.order.value === 'sequence' ? list : shuffle(list)
    pos = 0
    render()
  }

  const cache = new Map()
  async function loadBody(q) {
    if (cache.has(q.id)) return cache.get(q.id)
    const res = await fetch(`../data/q/${q.id}.json`)
    if (!res.ok) throw new Error('题目没载入')
    const data = await res.json()
    cache.set(q.id, data)
    return data
  }

  async function render() {
    const q = deck[pos]
    if (!q) return
    revealed = false
    stage.innerHTML = '<p class="hint">载入中…</p>'
    let body
    try {
      body = await loadBody(q)
    } catch (e) {
      stage.innerHTML = '<p class="hint">这道题没载入（可能是本地直接打开了文件）。用本地服务器预览即可。</p>'
      return
    }
    const stars = [1, 2, 3, 4].map((i) => `<i class="${i <= q.difficulty ? 'on' : ''}"></i>`).join('')
    stage.innerHTML = `
      <div class="practice__meta">
        <span>${q.courseShort} · ${q.chapterTitle}</span>
        <span>${q.kind}</span>
        <span>难度 <span class="dots">${stars}</span></span>
        <span>${q.tags.join(' · ')}</span>
      </div>
      <div class="practice__stem prose">${body.stemHtml}</div>
      ${body.hintHtml ? `<details class="qblock qblock--hint" style="margin-top:18px"><summary>提示</summary><div class="qblock__body prose">${body.hintHtml}</div></details>` : ''}
      <div class="practice__solution" id="p-solution" hidden>
        ${body.answerHtml ? `<div class="answer" style="margin-bottom:18px"><span>答案</span>${body.answerHtml}</div>` : ''}
        <div class="prose">${body.solutionHtml}</div>
        ${body.mistakesHtml ? `<details class="qblock" style="margin-top:18px"><summary>常见错误</summary><div class="qblock__body prose">${body.mistakesHtml}</div></details>` : ''}
      </div>
    `
    el.index.textContent = String(pos + 1)
    el.total.textContent = String(deck.length)
    el.open.href = '../' + q.url
    el.reveal.textContent = '看解析'
  }

  function reveal() {
    const sol = $('#p-solution')
    // 看了解析就记成「已做」——这是刷题页对进度最自然的定义
    if (!revealed && window.ReviewProgress && deck[pos]) window.ReviewProgress.mark(deck[pos].id, 'done', true)
    if (!sol) return
    sol.hidden = revealed
    revealed = !revealed
    el.reveal.textContent = revealed ? '收起解析' : '看解析'
    if (revealed) sol.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  function next() {
    if (!deck.length) return
    pos = (pos + 1) % deck.length
    render()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  fetch('../data/questions.json')
    .then((r) => r.json())
    .then((list) => {
      all = list
      const p = new URLSearchParams(location.search)
      if (p.get('course')) el.course.value = p.get('course')
      if (p.get('chapter')) el.chapter.value = p.get('chapter')
      if (p.get('random')) {
        el.order.value = 'random'
        el.status.value = 'undone'
      }
      build()
    })
    .catch(() => {
      stage.innerHTML = '<p class="hint">题库没载入。可能是在本地直接打开文件，用本地服务器预览即可。</p>'
    })

  if (window.RB && window.RB.bindCourseChapter) window.RB.bindCourseChapter(el.course, el.chapter)

  el.apply.addEventListener('click', build)
  // 切换期中/期末时重建题组（term.js 会广播 term:change）
  document.addEventListener('term:change', build)
  for (const s of [el.course, el.chapter, el.difficulty, el.order, el.status]) {
    if (s) s.addEventListener('change', build)
  }
  el.reveal.addEventListener('click', reveal)
  el.next.addEventListener('click', next)

  document.addEventListener('keydown', (ev) => {
    if (ev.target.matches('input, textarea, select')) return
    if (ev.code === 'Space') {
      ev.preventDefault()
      reveal()
    } else if (ev.key === 'Enter') {
      ev.preventDefault()
      next()
    }
  })
})()
