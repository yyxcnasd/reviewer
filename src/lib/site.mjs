/**
 * 页面模块的统一入口：外壳、HTML 工具、文本工具、公共片段都从这里取。
 * 各 build* 只需要 `import { ... } from '../lib/site.mjs'`。
 */
export { page, write, esc, attr, url, dots, stateLabel, tagHref, stemExcerpt } from './layout.mjs'
export * from './text.mjs'
export * from './partials.mjs'
