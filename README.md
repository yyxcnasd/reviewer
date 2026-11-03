# 复习册

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
| `/practice/` | 刷题：一次一道，先想再看解析；可只抽没做过的或收藏的 |
| `/tags/` | 标签索引，每个标签一个专题页 |
| `/papers/` | 历年真题（2019–2025 微积分、2024–2026 线代）的题型与考点索引 |
| `/submit/` | 投稿：Markdown + 公式实时预览，一键开 issue 或下载 `.md` |
| `/about/` | 范围说明、常见问题、内容组织方式、许可与图片来源 |

**进度**：「已做」「收藏」记在浏览器 localStorage 里，不上传。题库顶部、刷题侧栏、要点页的「本章已做」、首页的「已做 x / 100」都读同一份数据。换设备或清缓存会丢。

## 本地跑起来

```bash
npm install
npm run build      # 校验内容并生成到 docs/
npm run dev        # 生成 + 本地预览 http://localhost:4173/
npm run check      # 只校验内容，不生成
```

需要 Node 20+。没有其他系统依赖。

## 部署到 GitHub Pages

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
