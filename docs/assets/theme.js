/* 深浅色切换：按钮在导航右侧，选择记在本地 */
;(() => {
  const KEY = 'reviewer.theme'
  const root = document.documentElement
  const btn = document.getElementById('theme-toggle')

  // 允许用 ?theme=dark|light 强制（分享链接、截图时有用）
  const forced = new URLSearchParams(location.search).get('theme')
  if (forced === 'dark' || forced === 'light') {
    if (forced === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')
  }

  const current = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')

  function sync() {
    if (!btn) return
    const dark = current() === 'dark'
    // 按钮上写「点了会变成什么」，不用图标
    // 窄屏只留一个字，给导航腾地方
    const narrow = window.matchMedia('(max-width: 480px)').matches
    btn.textContent = narrow ? (dark ? '浅' : '深') : dark ? '浅色' : '深色'
    btn.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式')
    btn.setAttribute('aria-pressed', String(dark))
  }

  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')
    try {
      localStorage.setItem(KEY, theme)
    } catch (e) {
      /* 隐私模式下存不了，不影响使用 */
    }
    // KaTeX 与图片不需要重绘，只要换 CSS 变量
    sync()
  }

  btn?.addEventListener('click', () => apply(current() === 'dark' ? 'light' : 'dark'))

  // 没手动选过时，跟随系统
  try {
    if (!localStorage.getItem(KEY) && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
        if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light')
      })
    }
  } catch (e) {
    /* ignore */
  }

  sync()
})()
