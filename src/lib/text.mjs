/**
 * 文本工具：把一道题/一章压成一句话，供列表、翻页、笔记页的索引使用。
 */
import { stripMath } from '../markdown.mjs'

/** 章节的短名：范围表、面包屑、翻页里用，比全称好排 */
export const SHORT_TITLES = {
  'va1-1': '数列极限',
  'va1-2': '函数极限',
  'va1-3': '导数',
  'va1-4': '中值定理与泰勒',
  'va1-5': '黎曼积分',
  'va1-6': '广义积分',
  'va1-7': '常微分方程',
  'la-1': '行列式',
  'la-2': '矩阵',
  'la-3': '向量空间',
  'la-4': '秩与解的结构',
}

export function shortTitle(chapter) {
  return SHORT_TITLES[chapter.id] || chapter.title
}

/** 去掉公式与 markdown 记号后的纯文字 */
export function plainText(src) {
  return stripMath(String(src || ''))
    .replace(/[#*>`|]/g, ' ')
    .replace(/[，。、；：（）()\s]+/g, ' ')
    .trim()
}

/** 列表与翻页用的短标签：先按第一句取（不切词），取不动就退回「标签 · 难度」 */
export function shortLabel(question) {
  const first = String(question.stem || '').split(/\n\s*\n/)[0] || ''
  const plain = plainText(first).replace(/\s+/g, ' ').trim()
  const sentence = (plain.match(/^[^。；：!?？]{6,30}/) || [''])[0].trim()
  const cjk = (sentence.match(/[\u4e00-\u9fff]/g) || []).length
  // 公式被剥掉后会留下空格，断得太碎就退回标签
  const gaps = (sentence.match(/\s/g) || []).length
  if (cjk >= 6 && gaps <= 1) return sentence + (sentence.length < plain.length ? '…' : '')
  const tags = (question.tags || []).slice(0, 2).filter(Boolean).join('、')
  return (tags || question.kind) + ' · 难度 ' + question.difficulty
}

/** 章节对象：页面里到处要 ch.id → chapter，收一处 */
export function chapterOf(ctx, id) {
  return ctx.chapterById.get(id)
}
