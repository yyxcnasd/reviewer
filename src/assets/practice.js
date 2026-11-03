/* 刷题：一次一道，先想再看解析 */
;(() => {
  const stage = document.getElementById('stage')
  if (!stage) return
  const $ = (s) => document.querySelector(s)

  const el = {
    course: $('#p-course'),
    chapter: $('#p-chapter'),
    difficulty: $('#p-difficulty'),
    order: $('#p-order'),
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

  function build() {
    const course = el.course.value
    const chapter = el.chapter.value
    const difficulty = el.difficulty.value
    let list = all.filter(
      (q) =>
        (!course || q.course === course) &&
        (!chapter || q.chapter === chapter) &&
        (!difficulty || String(q.difficulty) === difficulty),
    )
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

  function render() {
    const q = deck[pos]
    if (!q) return
    revealed = false
    const stars = [1, 2, 3, 4].map((i) => `<i class="${i <= q.difficulty ? 'on' : ''}"></i>`).join('')
    stage.innerHTML = `
      <div class="practice__meta">
        <span>${q.courseShort} · ${q.chapterTitle}</span>
        <span>${q.kind}</span>
        <span>难度 <span class="dots">${stars}</span></span>
        <span>${q.tags.join(' · ')}</span>
      </div>
      <div class="practice__stem prose">${q.stemHtml}</div>
      ${q.answerHtml ? `<div class="practice__solution" id="p-solution" hidden><div class="answer" style="margin-bottom:18px"><span>答案</span>${q.answerHtml}</div>
        <div class="prose">${q.solutionHtml}</div>
        ${q.mistakesHtml ? `<details class="qblock" style="margin-top:18px"><summary>常见错误</summary><div class="qblock__body prose">${q.mistakesHtml}</div></details>` : ''}
      </div>` : `<div class="practice__solution prose" id="p-solution" hidden>${q.solutionHtml}</div>`}
    `
    el.index.textContent = String(pos + 1)
    el.total.textContent = String(deck.length)
    el.open.href = '../' + q.url
    el.reveal.textContent = '看解析'
  }

  function reveal() {
    const sol = $('#p-solution')
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
      build()
    })
    .catch(() => {
      stage.innerHTML = '<p class="hint">题库没载入。可能是在本地直接打开文件，用本地服务器预览即可。</p>'
    })

  el.apply.addEventListener('click', build)
  for (const s of [el.course, el.chapter, el.difficulty, el.order]) s.addEventListener('change', build)
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
