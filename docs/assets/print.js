/* 打印按钮：速查页与要点页共用 */
;(() => {
  for (const btn of document.querySelectorAll('[data-print]')) {
    btn.addEventListener('click', () => window.print())
  }
})()
