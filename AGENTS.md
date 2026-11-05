# AGENTS.md · 用 AI 定制这本复习册

这份文件写给「会读代码的 AI 代理」和「想把这本册子改成自己的复习册的人」。
目标：**改内容就能变成本校 / 本课的复习册，不用碰页面代码。**

---

## 1. 先认识仓库

```
build.mjs                 构建入口（CLI：--check-only / --serve）
site.config.json          站点名称、域名、仓库、学期、考试信息
content/
  courses.yml             课程 · 章节 · 小节 · 考纲轮次 · 关键词（整个站点的骨架）
  taxonomy.yml            大分类与标签（页面上的标签、标签页、筛选项都来自这里）
  questions/<course>/     一题一个 .md
  notes/<course>/         一章一个 .md
  cheatsheet/<course>.md  速查表（可按轮次拆成 <course>.md + <course>-extra.md）
src/
  pages/                  每一类页面一个模块
  lib/                    外壳、片段、工具
  assets/                 浏览器端脚本（筛选、编辑器、导出、主题、轮次…）
  styles/                 CSS，构建时拼成一个 site.css
docs/                     构建产物（**提交进仓库**，GitHub Pages 直接喂这个目录）
references/               讲义与真题 PDF（gitignore，不进仓库）
```

技术栈：纯 Node ESM，没有打包器。`node build.mjs` 读 content → 出静态 HTML 到 `docs/`。

---

## 2. 常用命令

```bash
node build.mjs --check-only   # 只校验内容（不写文件），出错会给文件名与原因
node build.mjs                # 生成 docs/
node build.mjs --serve        # 本地起服务预览
node scripts/check-links.mjs  # 检查全站内部链接
node scripts/subset-fonts.py  # 重新生成字体子集（新增生僻字后必须跑）
```

提交前建议三条都过：`--check-only`、`build`、`check-links`。

---

## 3. 数据模型

### 3.1 轮次（期中 / 期末）

`content/courses.yml` 顶部定义轮次 `midterm` / `final`。每门课、每章、每小节都可以写 `terms`：

```yaml
terms: { midterm: in, final: in }      # 两轮都考
terms: { midterm: out, final: in }     # 只有期末考
terms: { midterm: boundary, final: in }# 期中到此为止（会显示「止于此处」）
```

规则：
- 章节的状态由它的**小节**决定：全在范围 → `in`；部分在 → `partial`（页面显示「部分在范围」）；都不在 → `out`
- 课程级 `terms:` 决定这门课参与哪一轮；只有期末的课写 `terms: [final]`
- 页面上的「期中 / 期末」开关会同步：范围表、考纲、章节标签、题库筛选、速查表、导出打印页

### 3.2 题目

`content/questions/<course>/<id>.md`，文件名即题号：

```markdown
---
course: va1                 # courses.yml 里的课程 id
chapter: va1-3              # courses.yml 里的小节 id
category: calculus          # taxonomy.yml 里的大分类
tags: [导数定义, 高阶导数]    # 必须已登记在 taxonomy.yml
difficulty: 3               # 1–5，5 = 硬核
kind: 计算题
source: 自编
origin: 自编
answer: \(f^{(n)}(0)=(-1)^n n!\)
---

题面第一段（会当摘要）。

(1) 第一问……
(2) 第二问……

## 提示

一句话思路。

## 解析

完整推导。

## 常见错误

最常踩的那一个坑。
```

### 3.3 复习要点

`content/notes/<course>/<章节 id>.md`：

```markdown
---
course: va1
chapter: va1-3
title: 函数的导数
lead: 一句话说清这一章讲什么（≤40 字）
---

## 这一章要会什么

- 会用定义算导数与单侧导数
- …

## 3.1 导数与微分

### 定义与三种等价写法

正文、公式、`:::` 区块……

## 常见问法与易错点

- …
```

### 3.4 正文语法

- 行内公式 `\(...\)`，行间公式 `\[...\]`
- 区块：`:::theorem`、`:::definition`、`:::example`、`:::warning`、`:::tip`、`:::proof` 等，
  英文关键词，标题写在方括号里：`:::theorem[拉格朗日中值定理]`
- 多行推导用 `\begin{aligned}` / `\begin{cases}`，不要用表格写步骤链
- 真值表这类枚举才用 Markdown 表格

完整正则与字段以 `CONTENT.md` 为准；`/notation/` 页面也有可视说明。

### 3.5 速查表

`content/cheatsheet/<course>.md`：

```markdown
---
course: va1
terms: [midterm, final]     # 期中内容，期末也看
---

### 等价无穷小（\(x\to0\)）

\[\sin x\sim x,\quad \tan x\sim x\]
```

期末独有的部分放 `<course>-extra.md`（`terms: [final]`），页面会自动排成
「期中内容 → 期末补充」。

---

## 4. 定制任务清单（照做即可）

### 4.1 改成自己的学校 / 课程名

1. `site.config.json`：`name`、`wordmark`、`tagline`、`description`、`owner`、`repo`、`siteUrl`
2. `content/courses.yml`：课程 `name`、`short`、`book`、`scope_*`
3. `README.md` 顶部说明

### 4.2 加一门课

1. `courses.yml` 的 `courses:` 下加一项（`id` 用小写短名，如 `ds`）：

```yaml
- id: ds
  name: 数据结构
  short: 数构
  accent: indigo
  terms: [midterm, final]
  scope_midterm: 第 1 章 – 第 6 章
  scope_final: 第 1 章 – 第 10 章
  chapters:
    - id: ds-1
      no: "1"
      title: 绪论
      state: in
      terms: { midterm: in, final: in }
      sections:
        - no: "1.1"
          title: 基本概念
          state: in
          terms: { midterm: in, final: in }
          keywords: [抽象数据类型, 复杂度]
```

2. `content/questions/ds/`、`content/notes/ds/` 建目录，加题目与要点
3. `content/cheatsheet/ds.md`（可选）
4. `node build.mjs --check-only` 看有没有缺字段

### 4.3 调考试范围

改对应小节的 `terms:`。页面上的范围表、考纲、章节标签、题库筛选会一起变；
`--check-only` 会告诉你哪些章节还没有要点或题目。

### 4.4 换视觉

`src/styles/tokens.css` 里是纸色 / 墨色 / 红色 / 靛蓝与字号，改 token 就能换整套配色。
样式按 `tokens → base → home → pages-* → practical` 顺序拼成一个文件。

### 4.5 加一种页面

`src/pages/` 新建模块并导出 `buildXxx(ctx)`，在 `src/build.mjs` 的 `buildSite()` 里调用；
导航在 `src/lib/layout.mjs` 的 `navItems`。

---

## 5. 改完必须检查

```bash
node build.mjs --check-only    # 内容校验
node build.mjs                 # 生成
node scripts/check-links.mjs   # 死链
```

另外两条经验：
- **加生僻字后要跑 `scripts/subset-fonts.py`**，否则字形会回退到宋体、粗细不齐
- 构建末尾有 KaTeX 质量门：页面上出现 `katex-error` 会直接报错

---

## 6. 部署

`docs/` 是提交进仓库的产物，GitHub Pages 走 Actions（`.github/workflows/`）。
改完后 `git add -A && git commit && git push`，Actions 会重新构建并发布。

---

## 7. 给 AI 的提示词模板

```
仓库根目录有一本静态复习册（Node SSG，产物在 docs/）。
先读 AGENTS.md、CONTENT.md、content/courses.yml，理解数据模型，不要动 src/ 除非必要。

任务：把课程换成「数据结构」，期中范围第 1–6 章，期末整本。
要求：
1. 只改 content/ 下的文件与 site.config.json；
2. 题目按 CONTENT.md 的格式，一题一个文件，解析直接写推导；
3. 每题要有提示、解析、常见错误；
4. 完成后跑 node build.mjs --check-only、node build.mjs、node scripts/check-links.mjs，
   三条都过再结束；
5. 不要执行 git。
```

---

## 8. 边界

- 不要手改 `docs/`（下次 build 会覆盖）
- 不要在内容里写 HTML（会被转义）
- 图片放 `src/assets/photos/` 并在 `credits.json` 记来源
