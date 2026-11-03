/* 打印版：读链接参数，把题渲染成一张 A4 卷子 */
;(() => {
  const $ = (s) => document.querySelector(s)
  const sheet = $('#psheet')
  const status = $('#ps-status')
  if (!sheet) return

  const p = new URLSearchParams(location.search)
  const ids = (p.get('ids') || '').split(',').filter(Boolean)
  const want = {
    hint: p.get('hint') === '1',
    solution: p.get('solution') === '1',
    answer: p.get('answer') === '1',
    mistakes: p.get('mistakes') === '1',
    newpage: p.get('newpage') === '1',
    work: p.get('work') === '1',
    meta: p.get('meta') !== '0',
    size: p.get('size') || 'normal',
  }
  const auto = p.get('auto') === '1'

  const SIZE = { small: '9.4pt', normal: '10.4pt', large: '11.6pt' }
  document.documentElement.style.setProperty('--pq-size', SIZE[want.size] || SIZE.normal)

  // 出错时只改那一行提示，别把静态的页头（h1）冲掉
  function fail(html) {
    const hint = sheet.querySelector('.psheet-empty')
    if (hint) hint.innerHTML = html
    else sheet.insertAdjacentHTML('beforeend', `<p class="psheet-empty">${html}</p>`)
  }

  if (!ids.length) {
    fail('没有选题。回到<a href="../">导出页</a>挑几道题。')
    if (status) status.textContent = '没有选题'
    return
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

  const date = new Date()
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  function metaLine(q) {
    if (!want.meta) return ''
    const bits = [q.id.toUpperCase(), q.chapterTitle, q.kind, `难度 ${q.difficulty}`]
    if (q.tags && q.tags.length) bits.push(q.tags.join(' / '))
    return `<p class="pq__meta">${bits.map(esc).join(' · ')}</p>`
  }

  function article(q, body, n) {
    const cls = ['pq']
    if (want.newpage && n > 1) cls.push('pq--newpage')
    return `<article class="${cls.join(' ')}" data-id="${q.id}">
      <div class="pq__no">${n}</div>
      <div class="pq__body">
        ${metaLine(q)}
        <div class="pq__stem">${body.stemHtml || ''}</div>
        ${want.work ? '<div class="pq__work" aria-hidden="true"></div>' : ''}
        ${want.hint && body.hintHtml ? `<div class="pq__hint"><b>提示</b>${body.hintHtml}</div>` : ''}
        ${want.solution && body.solutionHtml ? `<div class="pq__solution"><span class="pq__label">解析</span>${body.solutionHtml}</div>` : ''}
        ${want.answer && body.answerHtml ? `<div class="pq__answer"><b>答案</b>${body.answerHtml}</div>` : ''}
        ${want.mistakes && body.mistakesHtml ? `<div class="pq__mistakes"><span class="pq__label">常见错误</span>${body.mistakesHtml}</div>` : ''}
      </div>
    </article>`
  }

  function titleFor(list) {
    const courses = [...new Set(list.map((x) => x.courseShort))]
    const chapters = [...new Set(list.map((x) => x.chapterTitle))]
    const what = want.solution ? '题面与解析' : '题面'
    if (list.length === 1) return `${list[0].chapterTitle} · 单题`
    if (chapters.length === 1) return `${chapters[0]} · ${list.length} 题 · ${what}`
    return `${courses.join(' / ')} · ${list.length} 题 · ${what}`
  }

  Promise.all([
    fetch('../../data/questions.json').then((r) => r.json()),
    Promise.all(
      ids.map((id) =>
        fetch(`../../data/q/${id}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    ),
  ])
    .then(([index, bodies]) => {
      const byId = new Map(index.map((q) => [q.id, q]))
      const rows = []
      ids.forEach((id, i) => {
        const q = byId.get(id)
        const body = bodies[i]
        if (q && body) rows.push({ q, body })
      })
      if (!rows.length) {
        fail('题目没载入。回到<a href="../">导出页</a>重试。')
        if (status) status.textContent = '题目没载入'
        return
      }

      const list = rows.map((r) => r.q)
      sheet.innerHTML = `
        <header class="psheet__head">
          <h1 class="psheet__title">${esc(titleFor(list))}</h1>
          <p class="psheet__meta">复习册 · ${stamp} · ${rows.length} 道 · ${
            want.solution ? '含解析与答案' : '只含题面'
          }${want.newpage ? ' · 每题另起一页' : ''}${want.work ? ' · 留答题空间' : ''}</p>
          ${want.solution ? '' : '<p class="psheet__fields">姓名 ____________ 日期 ____________ 用时 ______ 得分 ______</p>'}
        </header>
        ${rows.map((r, i) => article(r.q, r.body, i + 1)).join('\n')}
        <footer class="psheet__foot">
          <span>复习册 · 微积分 A1 与线性代数期中复习</span>
          <span>${rows.length} 道</span>
        </footer>`
      if (want.solution || want.mistakes) sheet.classList.add('psheet--flow')
      document.title = `${titleFor(list)} · 打印版`
      if (status) status.textContent = `已载入 ${rows.length} 道，可以打印了`

      // 从站点里点「生成 PDF」过来时自动拉起打印对话框
      if (auto) setTimeout(() => window.print(), 600)
    })
    .catch(() => {
      fail('载入失败。回到<a href="../">导出页</a>重试。')
      if (status) status.textContent = '载入失败'
    })

  document.getElementById('ps-print')?.addEventListener('click', () => window.print())
  document.getElementById('ps-back')?.addEventListener('click', () => {
    if (history.length > 1) history.back()
    else location.href = '../'
  })
  document.getElementById('ps-copy')?.addEventListener('click', async (ev) => {
    try {
      await navigator.clipboard.writeText(location.href)
      ev.target.textContent = '链接已复制'
      setTimeout(() => (ev.target.textContent = '复制这个链接'), 1800)
    } catch {
      ev.target.textContent = '复制失败'
    }
  })

  // 打印前把折叠内容全部展开（这里本来就没有折叠，留个保险）
  window.addEventListener('beforeprint', () => {
    for (const d of document.querySelectorAll('details')) d.open = true
  })
})()
