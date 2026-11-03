# 复习册 · 通用复习站

微积分 A1 与线性代数期中复习站。两门课的范围、章节要点、**100 道自编题与解析**，加上一个可以投稿的题目归档。

纯静态站点，构建后直接放到 GitHub Pages 上，所有链接都是相对路径，放在仓库子路径下（`https://<user>.github.io/<repo>/`）也能用。

---

## 里面有什么

面向「打开就要用」：首页第一屏是搜题框和四个入口，第二屏是两门课的范围表，第三屏是精选题。

| 页面 | 内容 |
| --- | --- |
| `/` | 首页：搜题 + 入口（题库/刷题/速查/真题）+ 范围表（章 · 内容 · 范围 · 题数 · 要点）+ 六道精选题 + 三条必背 |
| `/va1/` `/la/` | 两门课的完整考纲：每章的小节、范围状态、要点与题数 |
| `/notes/<章节>.html` | 复习要点：定义、定理条件、怎么用、例题（7 篇），带本章进度与打印 |
| `/questions/` | 题库：100 道题，按科目/章节/标签/难度/状态筛，可按难度排序 |
| `/questions/<id>.html` | 单题：题面、提示、解析、答案、常见错误；`←` `→` 翻题、`E` 展开、`D` 记已做、一键复制题目 |
| `/cheatsheet/` | 速查表：等价无穷小、麦克劳林、求导、中值定理、行列式、逆矩阵、线性相关，A4 双栏可打印 |
| `/export/` | 导出 PDF：勾题 → 选内容与版式 → 生成 A4 卷子（\`/export/print/?ids=...\`） |
| `/practice/` | 刷题：一次一道，先想再看解析；可只抽没做过的或收藏的 |
| `/tags/` | 标签索引，每个标签一个专题页 |
| `/papers/` | 历年真题（2019–2025 微积分、2024–2026 线代）的题型与考点索引 |
| `/submit/` | 投稿：Markdown + 公式实时预览，一键开 issue 或下载 `.md` |
| `/about/` | 范围说明、常见问题、内容组织方式、许可与图片来源 |

**进度**：「已做」「收藏」记在浏览器 localStorage 里，不上传。题库顶部、刷题侧栏、要点页的「本章已做」、首页的「已做 x / 100」都读同一份数据。换设备或清缓存会丢。

## 导出 PDF

站点没有后端，导出走的是「把卷子渲染成一张 A4 打印版 → 浏览器打印 → 另存为 PDF」这条路：
公式是 KaTeX 渲染出来的真文字（不是截图），PDF 里可以搜索、可以复制、字体是嵌进去的。

- **挑范围**：`/export/` 里按科目/章节/标签/难度筛，或者手勾；题库页的「导出筛选结果」会把当前筛选带过去，科目页每章有「导出」，标签页有「导出这 n 道」，题目页有「导出这道题」。
- **挑内容**：预设三个——只要题面 / 题面+解析 / 全都要（提示、答案、常见错误可单独勾）。
- **挑版式**：每题另起一页、题面后留答题空间（出一份能直接写的卷子）、是否标出章节与考点、字号小/中/大。
- **得到 PDF**：点「生成 PDF（新标签页）」会打开 `/export/print/?ids=...`，自动拉打印对话框，目标选「另存为 PDF」。这个链接可以直接发给同学，打开就是同一份卷子。
- 只出题面时，卷头会带一行「姓名 ____ 日期 ____ 用时 ____ 得分 ____」。

命令行验证过：14 道带解析的卷子是 11 页 A4、282KB，KaTeX 字体已嵌入。

## TeX 缩写

内容里写公式时可以用短写，构建时展开成标准 TeX（斜体/正体也一起处理）：

| 缩写 | 展开成 | 用在哪 |
| --- | --- | --- |
| `\e` | `\mathrm{e}` | 自然常数，正体 |
| `\d` | `\mathrm{d}` | 微分算子：`\d x`、`\frac{\d y}{\d x}` |
| `\i` | `\mathrm{i}` | 虚数单位 |
| `\R \N \Z \Q \C` | `\mathbb{R}` … | 数集 |
| `\abs{}` `\norm{}` | `\left|…\right|` | 绝对值、范数 |
| `\rank` `\tr` `\diag` `\sgn` | `\operatorname{…}` | 算子名 |
| `\eps` `\T` | `\varepsilon`、`^{\mathrm{T}}` | ε、转置 |

规则：缩写后面紧跟字母时不展开（`\exp`、`\det`、`\delta` 不受影响），只在公式内部生效。
完整表格与「为什么 e 要正体」在 `/notation/`。

## 考试轮次

`content/courses.yml` 顶部的 `terms` 定义轮次（现在是「期中 / 期末」），每个小节的 `terms` 写它在各轮次里的状态：

```yaml
terms:
  - id: midterm
    label: 期中
  - id: final
    label: 期末

# 章节里
sections:
  - no: "4.3"
    title: 泰勒公式
    terms:
      midterm: boundary   # 期中：到这里为止
      final: in           # 期末：在范围内
```

页面右上角可以切换轮次，选择记在本地；范围表、科目页的考纲、题目页的「范围」、题库的「范围」筛选都跟着变。
再加一门课，只要在 `courses:` 下加一项；再加一个轮次，只要在 `terms:` 下加一项。

## 代码结构

```
build.mjs                CLI：读参数、校验内容、打印报告
src/
  content.mjs            读 content/ 并校验，产出页面用的上下文（唯一的数据入口）
  build.mjs              站点组装：页面顺序 + 静态资源 + CSS 打包
  markdown.mjs            Markdown + 公式（KaTeX，构建时渲染）
  serve.mjs              本地预览服务器
  lib/
    layout.mjs           页面外壳（head / 导航 / 页脚）
    text.mjs             短标题、短标签、章节查找
    partials.mjs         面包屑、页头、题目行、标签、下拉选项
    site.mjs             上面几个的统一出口，页面只从这里 import
  pages/                 一个页面一个模块
    home.mjs courses.mjs notes.mjs questions.mjs tags.mjs
    papers.mjs practice.mjs submit.mjs cheatsheet.mjs about.mjs
    export.mjs extras.mjs（404 / data/*.json / sitemap）
  styles/                tokens → base → home → pages → practical（构建时拼接）
  assets/                core.js（公共工具）+ 各页面脚本 + 字体 + 图片
content/                 所有中文内容（题目、要点、考纲、标签、速查表）
```

约定：
- 页面模块只从 `../lib/site.mjs` 取工具，不直接摸 fs/path（除了确实要读文件的速查表与关于页）。
- 同一段 HTML 只在 `partials.mjs` 里写一次（题目行、面包屑、页头、下拉选项）。
- 浏览器端公共工具在 `assets/core.js`（`window.RB`），页面脚本不再各写一份 `# 复习册

微积分 A1 与线性代数期中复习站。两门课的范围、章节要点、**100 道自编题与解析**，加上一个可以投稿的题目归档。

纯静态站点，构建后直接放到 GitHub Pages 上，所有链接都是相对路径，放在仓库子路径下（`https://<user>.github.io/<repo>/`）也能用。

---

## 里面有什么

面向「打开就要用」：首页第一屏是搜题框和四个入口，第二屏是两门课的范围表，第三屏是精选题。

| 页面 | 内容 |
| --- | --- |
| `/` | 首页：搜题 + 入口（题库/刷题/速查/真题）+ 范围表（章 · 内容 · 范围 · 题数 · 要点）+ 六道精选题 + 三条必背 |
| `/va1/` `/la/` | 两门课的完整考纲：每章的小节、范围状态、要点与题数 |
| `/notes/<章节>.html` | 复习要点：定义、定理条件、怎么用、例题（7 篇），带本章进度与打印 |
| `/questions/` | 题库：100 道题，按科目/章节/标签/难度/状态筛，可按难度排序 |
| `/questions/<id>.html` | 单题：题面、提示、解析、答案、常见错误；`←` `→` 翻题、`E` 展开、`D` 记已做、一键复制题目 |
| `/cheatsheet/` | 速查表：等价无穷小、麦克劳林、求导、中值定理、行列式、逆矩阵、线性相关，A4 双栏可打印 |
| `/export/` | 导出 PDF：勾题 → 选内容与版式 → 生成 A4 卷子（\`/export/print/?ids=...\`） |
| `/practice/` | 刷题：一次一道，先想再看解析；可只抽没做过的或收藏的 |
| `/tags/` | 标签索引，每个标签一个专题页 |
| `/papers/` | 历年真题（2019–2025 微积分、2024–2026 线代）的题型与考点索引 |
| `/submit/` | 投稿：Markdown + 公式实时预览，一键开 issue 或下载 `.md` |
| `/about/` | 范围说明、常见问题、内容组织方式、许可与图片来源 |

**进度**：「已做」「收藏」记在浏览器 localStorage 里，不上传。题库顶部、刷题侧栏、要点页的「本章已做」、首页的「已做 x / 100」都读同一份数据。换设备或清缓存会丢。

## 导出 PDF

站点没有后端，导出走的是「把卷子渲染成一张 A4 打印版 → 浏览器打印 → 另存为 PDF」这条路：
公式是 KaTeX 渲染出来的真文字（不是截图），PDF 里可以搜索、可以复制、字体是嵌进去的。

- **挑范围**：`/export/` 里按科目/章节/标签/难度筛，或者手勾；题库页的「导出筛选结果」会把当前筛选带过去，科目页每章有「导出」，标签页有「导出这 n 道」，题目页有「导出这道题」。
- **挑内容**：预设三个——只要题面 / 题面+解析 / 全都要（提示、答案、常见错误可单独勾）。
- **挑版式**：每题另起一页、题面后留答题空间（出一份能直接写的卷子）、是否标出章节与考点、字号小/中/大。
- **得到 PDF**：点「生成 PDF（新标签页）」会打开 `/export/print/?ids=...`，自动拉打印对话框，目标选「另存为 PDF」。这个链接可以直接发给同学，打开就是同一份卷子。
- 只出题面时，卷头会带一行「姓名 ____ 日期 ____ 用时 ____ 得分 ____」。

命令行验证过：14 道带解析的卷子是 11 页 A4、282KB，KaTeX 字体已嵌入。

。

## 进度页

`/stats/`：按章节列出已做、收藏与进度条，四个常用动作（继续刷题、随机抽一道、只看没做的、只看收藏的）。
数据来自浏览器 localStorage（`reviewer.progress.v1`），不上传。

## 深色模式

导航右侧的「深色 / 浅色」按钮切换，默认跟随系统，选择记在 `localStorage`（`reviewer.theme`）。
深色模式只影响屏幕：`@media print` 里所有颜色令牌都会回到浅色，导出的 PDF 与打印稿永远是白纸黑字。
链接上加 `?theme=dark` / `?theme=light` 可以强制。

## 本地跑起来

```bash
npm install
npm run build      # 校验内容并生成到 docs/
npm run dev        # 生成 + 本地预览 http://localhost:4173/
npm run check      # 只校验内容，不生成
```

需要 Node 20+。没有其他系统依赖。

## 部署到 GitHub Pages

> 一个可以长出来的复习站：课程是模块，考试轮次（期中 / 期末）可切换，题库与讲义要点共用一套内容格式。
> 第一批模块是微积分 A1 与线性代数（含「其他」这一类，放课外题与竞赛题）。
> 站点在 <https://yyxcnasd.github.io/reviewer/>。改动 `content/` 推到 `main`，
> Actions 会重新构建并发布，不需要本地跑构建。

下面两种方式任选其一，换仓库或重装时用得上。

**方式一：仓库设置里指定 docs/（最简单）**

1. 建仓库，把本仓库推上去。
2. Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`，目录选 `/docs`。
3. 推送后等一分钟，站点在 `https://<你的用户名>.github.io/<仓库名>/`。

**方式二：GitHub Actions（内容更新自动构建）**

仓库里带了 `.github/workflows/deploy.yml`：推送到 `main` 时自动构建并部署。这时把 Settings → Pages → Source 改成 `GitHub Actions` 即可。

两种方式都要求 `docs/.nojekyll` 存在（构建脚本会生成），否则 GitHub 的 Jekyll 会忽略下划线开头的文件。

### 部署前改一处

`site.config.json` 里的仓库地址和站点地址还是占位符：

```json
"repo": "your-github-name/reviewer",
"siteUrl": "https://your-github-name.github.io/reviewer/"
```

改成你自己的。`repo` 决定投稿页「在 GitHub 开 issue」按钮指向哪里，`siteUrl` 决定 sitemap 与分享链接。改完重新 `npm run build`。

## 内容怎么改

全部内容都是仓库里的 Markdown，改文件即可，不碰代码：

```
content/
  courses.yml               课程、章节、考纲状态、判定器关键词
  taxonomy.yml              大分类与标签（管理员维护）
  notes/<course>/<章节>.md   复习要点
  questions/<course>/<id>.md 题目，一题一个文件
  papers.yml                历年真题索引
  papers-notes.md           真题横向统计
```

格式规范在 [`CONTENT.md`](CONTENT.md)：frontmatter 字段、正文结构（题面 → `## 提示` → `## 解析` → `## 常见错误`）、公式写法（`\( \)` 与 `\[ \]`）。

构建会检查每一条：字段缺失、章节 id 不存在、公式写坏（KaTeX 语法错误）都会报错并指出文件，`npm run check` 会直接失败。

## 投稿流程

1. 读者在 `/submit/` 写题，实时预览，一键打开 GitHub issue（模板见 `.github/ISSUE_TEMPLATE/question-submission.yml`）；issue 太长放不下时可以下载 `.md` 附在评论里。
2. 管理员审数学与格式，然后：

   ```bash
   node scripts/issue-to-question.mjs --issue 42 --write
   ```

   它会把 issue 正文（表单格式或站里生成的 frontmatter 格式都认）转成 `content/questions/<course>/<id>.md`，编号自动顺延。
3. 合并 PR，Pages 自动重新构建，题目出现在题库、标签页和对应章节里。

本地写题可以直接用脚手架：

```bash
node scripts/new-question.mjs --course va1 --chapter va1-4 --tags 泰勒公式,极限计算
```

## 技术

- 构建：一个 Node ESM 脚本（`build.mjs` + `src/`），无框架、无打包器。
- 数学：KaTeX，**构建时**渲染成 HTML + MathML，运行时不需要 JavaScript 也能读公式。
- 字体：Noto Serif SC（SIL OFL 1.1），按站点实际用到的字做子集（三个字重共约 550 KB），`scripts/subset-fonts.py` 可重新生成。
- 运行时 JS 只在两处出现：题库筛选、刷题、投稿预览。其余页面是纯 HTML。
- 设计：按 [tasteskill v2](https://github.com/taste-skill) 的流程做（方向抽取 → 室内规则 → 真浏览器量测 → 看截图critique）。方向为 colour-chapters，配色按学科材质改写：试卷纸、墨、批改红、墨水蓝。

## 许可

- 文字与题目：CC BY-SA 4.0
- 代码：MIT
- 图片：见 `/about/` 的来源表（公有领域 / CC BY / CC BY-SA，均来自 Wikimedia Commons）

## 致谢

课本章节依据《高等微积分教程（上）》（刘智新、闫浩、章纪民）与《线性代数与几何（第 2 版，上）》（俞正光、鲁自群、林润亮）。历年期中试题的整理版来自 mathsdream/THU-math-source 等公开资料，本站只做考点索引，不整题收录。
