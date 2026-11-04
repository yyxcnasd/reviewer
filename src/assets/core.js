/* 复习册 · 浏览器端公共小工具
   先于其它脚本加载，把 $ / $$ / escapeHtml / 本地存取挂到 window.RB 上。 */
;(() => {
  const RB = {
    $: (sel, root = document) => root.querySelector(sel),
    $$: (sel, root = document) => Array.from(root.querySelectorAll(sel)),

    escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c])
    },

    /** 读 localStorage 里的 JSON，坏了就当没有 */
    readStore(key, fallback) {
      try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
      } catch {
        return fallback
      }
    },

    writeStore(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* 隐私模式写不进去，不影响页面使用 */
      }
    },

    /** 复制到剪贴板，返回是否成功 */
    async copy(text) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        return false
      }
    },

    /**
     * 打印：先把折叠块全部展开（纸上不该有「点击展开」），
     * 打印结束后恢复原状。
     */
    printAll() {
      const closed = []
      for (const d of document.querySelectorAll('details:not([open])')) {
        d.open = true
        closed.push(d)
      }
      const restore = () => {
        for (const d of closed) d.open = false
        window.removeEventListener('afterprint', restore)
      }
      window.addEventListener('afterprint', restore)
      window.print()
    },

    /** 打印按钮：页面上任何 [data-print] 都生效 */
    bindPrintButtons() {
      for (const btn of document.querySelectorAll('[data-print]')) {
        btn.addEventListener('click', () => window.RB.printAll())
      }
    },
  }

  window.RB = RB
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RB.bindPrintButtons())
  } else {
    RB.bindPrintButtons()
  }
})()
