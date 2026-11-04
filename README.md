# 复习册 · 通用复习站

课程范围、讲义要点、题库与解析放在一处的静态复习站。考试轮次（期中 / 期末）可切换，题目可以投稿归档，公式在构建时渲染成 HTML，关掉 JavaScript 也能读题。

现在的课程：微积分 A1、线性代数、离散数学 1（只有期末）、计算机系统概论。共 271 道题（每章至少 4 道难度 4，另有 30 道第 5 档硬核题）、22 篇要点。

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 首页：搜题、入口条、按轮次的范围表、六道精选题、速查与投稿 |
| `/va1/` `/la/` `/dm1/` `/ics/` | 每门课的考纲：章节、小节、范围状态、本章题数与要点入口 |
| `/notes/<章节>/` | 复习要点：定义怎么叙述、定理的适用条件、最容易算错的那一步 |
| `/questions/` | 题库：按科目 / 章节 / 标签 / 难度 / 范围 / 状态筛，可按难度排序 |
| `/questions/<id>.html` | 单题页：题面、提示、解析、常见错误、答案，同章题目与上一题 / 下一题 |
| `/practice/` | 刷题：一次一道，先想再看，看解析自动记「已做」 |
| `/tags/` | 标签索引与标签页 |
| `/cheatsheet/` | 速查表：等价无穷小、麦克劳林、求导、中值定理、行列式、逆矩阵、线性相关，A4 可打印 |
| `/notation/` | 符号与缩写：为什么 e 要正体、改写对照、16 条 TeX 缩写 |
| `/export/` | 导出 PDF：勾题 → 选内容与版式 → 生成 A4 卷子（`/export/print/?ids=...`） |
| `/stats/` | 进度：按章节的已做、收藏、进度条，四档难度分布 |
| `/submit/` | 投稿：Markdown 编辑器 + 实时预览 + 一键开 issue / 下载 .md |
| `/about/` | 范围说明、内容组织、许可、图片来源 |

## 导航

右上角一组：**课程**（下拉，四门课 + 全部题库）、题库、刷题、速查、进度，然后是「期中 / 期末」开关、深浅色、投稿。
课程下拉用 `<details>` 实现，不需要 JavaScript；只有期末的课（离散数学）在菜单里带「仅期末」标记。

## 写法

题目与笔记都用同一套 Markdown 写法，完整说明在 `/markdown/`（页脚「写法说明」也可进）：
公式用 `\(…\)` / `\[…\]`；「定义 / 定理 / 结论 / 例 / 注意 / 提示 / 证明」用 `:::` 区块（类型词 + 方括号标题）：

```markdown
:::theorem[中值定理]
若 \(f\) 在 \([a,b]\) 上连续、在 \((a,b)\) 内可导……
:::
```

类型词：`theorem` `lemma` `definition` `corollary` `example` `warning` `info` `proof`（中文 `定理` `定义` `例` `注意` `提示` 也能用）。

## 考试轮次

`content/courses.yml` 顶部的 `terms` 定义轮次，每门课用 `terms:` 声明自己有哪些轮次，每个小节用 `terms:` 写它在各轮次里的状态：

```yaml
terms:
  - id: midterm
    label: 期中
  - id: final
    label: 期末

courses:
  - id: va1
    terms: [midterm, final]        # 不写就是全都有
    chapters:
      - id: va1-4
        no: "4"
        title: 导数应用
        sections:
          - no: "4.3"
            title: 泰勒公式
            terms:
              midterm: boundary    # 期中：到此为止
              final: in            # 期末：在范围内
```

`in` 在范围内 / `boundary` 到此为止 / `out` 不在范围。导航右上角切换轮次，范围表、考纲、题目页的范围、题库的筛选一起变；只有期末的课（如离散数学）在期中那一轮会标注「本课无期中」。

## TeX 缩写

写公式时可以用短写，构建时展开成标准 TeX：

| 缩写 | 展开成 | 用在哪 |
| --- | --- | --- |
| `\e` | `\mathrm{e}` | 自然常数，正体 |
| `\d` | `\mathrm{d}` | 微分算子：`\d x`、`\frac{\d y}{\d x}` |
| `\i` | `\mathrm{i}` | 虚数单位 |
| `\R \N \Z \Q \C` | `\mathbb{R}` … | 数集 |
| `\abs{}` `\norm{}` | `\left|…\right|` | 绝对值、范数 |
| `\rank` `\tr` `\diag` `\sgn` | `\operatorname{…}` | 算子名 |
| `\eps` `\T` | `\varepsilon`、`^{\mathrm{T}}` | ε、转置 |

缩写后紧跟字母时不展开（`\exp`、`\det`、`\delta` 不受影响），只在公式内部生效。规则在 `src/shorthands.mjs`，投稿页预览用构建时生成的 `assets/shorthands.js`，两边一致。

## 筛选与范围

筛选全部在客户端完成，条件写在地址栏里，可以直接分享：

- `/questions/?difficulty=4` 只看挑战档，`?tag=泰勒公式`、`?chapter=va1-4`、`?status=undone`、`?q=极限`
- `?scope=` 留空表示「全部」；不写则按当前轮次只显示范围内的题
- 切轮次后，范围筛选、题目行上的「不在本轮范围」标记都会跟着变

被筛掉的题用 `[hidden]` 隐藏。`.qrow` 自己带 `display: grid`，会盖掉浏览器默认的 `[hidden]`，所以基础样式里有一条 `[hidden] { display: none !important }` 兜底——少了它筛选只改数字不改列表。

## 投稿编辑器

软换行、随内容自动增高、字数与行数统计、Tab 插入两空格、括号与 `$` 自动配对、Tab 跳出右括号、`Ctrl+B` / `Ctrl+I` / `Ctrl+E`、`Ctrl+Z` 可撤销工具条插入；右侧实时预览与 frontmatter，另有「专注」按钮收起预览。

## 深色模式

导航右侧「深色 / 浅色」切换，默认浅色，选择记在 `localStorage`（`reviewer.theme`）。`@media print` 里所有颜色令牌回到浅色，导出的 PDF 与打印稿永远是白纸黑字；链接上加 `?theme=dark` / `?theme=light` 可以强制。

## 代码结构

```
build.mjs                CLI：读参数、校验内容、打印报告
src/
  content.mjs            读 content/ 并校验，产出页面用的上下文
  build.mjs              站点组装：页面顺序 + 静态资源 + CSS 打包
  markdown.mjs           Markdown + 公式（KaTeX，构建时渲染）
  shorthands.mjs         TeX 缩写表与展开规则（同时生成浏览器版本）
  serve.mjs              本地预览服务器
  lib/
    layout.mjs           页面外壳（head / 导航 / 页脚）
    text.mjs             短标题、短标签、章节查找
    partials.mjs         面包屑、页头、题目行、标签、下拉选项
    site.mjs             上面几个的统一出口
  pages/                 一个页面一个模块
    home courses notes questions tags cheatsheet
    practice submit about notation stats export extras
  styles/                tokens → base → home → pages-browse/tools/detail/misc → practical
  assets/                core.js / theme.js / term.js / 各页面脚本 / 字体 / 图片
content/
  courses.yml            课程、章节、轮次与范围
  taxonomy.yml           大分类与标签
  notes/<课程>/*.md      复习要点，一章一个
  questions/<课程>/*.md  题目，一题一个
  cheatsheet.md          速查表正文
```

约定：页面模块只从 `../lib/site.mjs` 取工具；同一段 HTML 只在 `partials.mjs` 里写一次；浏览器端公共工具在 `assets/core.js`（`window.RB`）。

## 本地跑起来

```bash
npm install
npm run build        # 生成 docs/
npm run dev          # 生成 + 预览 http://localhost:4173/
npm run check        # 只校验内容（frontmatter、章节 id、公式是否能渲染）
npm run links        # 检查所有内部链接
npm run new:question # 交互式新建一道题
```

改内容只需要动 `content/`；改完 `npm run build`，`docs/` 一起提交即可。

## 部署到 GitHub Pages

当前仓库是 public，Pages 的 Source 是 **GitHub Actions**，站点在 <https://yyxcnasd.github.io/reviewer/>。改动推到 `main`，Actions 会重新构建并发布。

也可以把 Pages 的 Source 改成 `Deploy from a branch` / `main` / `/docs`：`docs/` 是构建产物，已经提交在仓库里。

别忘了把 `site.config.json` 里的 `repo` 与 `siteUrl` 改成你自己的（否则投稿页的 issue 按钮会指向不存在的仓库，`npm run build` 会提醒）。

## 加一门课 / 加一道题

- **加课**：在 `content/courses.yml` 里加一项（id、名称、章节、每节的范围与 keywords），再把 `site.config.json` 的导航补一项。
- **加题**：`content/questions/<课程>/<id>.md`，frontmatter 写 course / chapter / tags / difficulty / kind，正文第一段是题面，然后 `## 提示`、`## 解析`、`## 常见错误`。格式细节见 `CONTENT.md`。
- **加要点**：`content/notes/<课程>/<章节 id>.md`，frontmatter 写 chapter / course / title / lead。

## 许可

代码 MIT；文字与题目 CC BY-SA 4.0。图片版权属于各自的收藏机构，出处见 `/about/`。
