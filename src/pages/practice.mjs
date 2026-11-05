import fs from 'node:fs'
import path from 'node:path'

import {
  page,
  write,
  url,
  esc,
  attr,
  dots,
  stateLabel,
  tagHref,
  stemExcerpt,
  shortLabel,
  shortTitle,
  chapterOf,
  crumb,
  pageHead,
  stat,
  statCount,
  tagChips,
  tagChipsList,
  progressFlags,
  questionRow,
  courseOptions,
  chapterOptions,
  tagOptions,
  difficultyOptions,
  DIFFICULTIES,
  stateChip,
} from '../lib/site.mjs'

/* ---------------------------------------------------------------- 刷题 */

export function buildPractice(ctx) {

  const chapterOptions = ctx.courses
    .map((c) => {
      const inCh = c.chapters.filter((ch) => (ctx.qByChapter.get(ch.id) || []).length)
      if (!inCh.length) return ''
      return `<optgroup label="${esc(c.name)}">${inCh
        .map((ch) => `<option value="${ch.id}">${esc(shortTitle(ch))}</option>`)
        .join('')}</optgroup>`
    })
    .join('')

  const body = `
<div class="frame">
  ${crumb(1, [{ href: '', label: ctx.config.wordmark }, { href: 'questions/', label: '题库' }, { label: '刷题' }])}
  <header class="pagehead">
    <div class="pagehead__inner">
      <h1 class="pagehead__title">刷题</h1>
      <div class="pagehead__scope">
        <p>一次一道。先想，再看提示与解析。</p>
      </div>
    </div>
  </header>

  <div class="practice">
    <div class="practice__stage">
      <div class="practice__card" id="stage" aria-live="polite">
        <p class="hint">正在载入题库…</p>
      </div>
      <div class="practice__controls">
        <button class="btn btn--red" id="p-reveal" type="button">看解析</button>
        <button class="btn" id="p-next" type="button">下一题</button>
        <button class="btn btn--tone" id="p-open" type="button">打开题目页</button>
        <span class="practice__progress">第 <b id="p-index">0</b> / <b id="p-total">0</b> 道</span>
      </div>
    </div>
    <aside class="practice__side">
      <div class="practice__filters">
        <div class="field"><label for="p-course">科目</label><select id="p-course">${courseOptions(ctx)}</select></div>
        <div class="field"><label for="p-chapter">章节</label><select id="p-chapter"><option value="">全部</option>${chapterOptions}</select></div>
        <div class="field"><label for="p-difficulty">难度</label>
<select id="p-difficulty">${difficultyOptions()}</select></div>
        <div class="field"><label for="p-status">状态</label>
          <select id="p-status"><option value="">全部</option><option value="undone">还没做</option><option value="fav">收藏的</option></select>
        </div>
        <div class="field"><label for="p-order">顺序</label>
          <select id="p-order"><option value="random">随机</option><option value="sequence">按题号</option></select>
        </div>
        <button class="btn btn--tone" id="p-apply" type="button">重新抽题</button>
      </div>
      <div class="callout"><b>键盘</b>空格 看解析 / 回车 下一题。<br><span data-progress-total="100">0 / 100</span> 已做 · 看解析时自动记上。</div>
    </aside>
  </div>
</div>
${'<script src="' + url(1, 'assets/practice.js') + '" defer></script>'}`
  write(ctx, 'practice/index.html', page(ctx, { depth: 1, title: '刷题', description: '随机抽题，按章节与难度筛，做完看解析。', body, bodyClass: 'detail', navActive: 'practice' }))
}
