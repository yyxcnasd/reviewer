# 内容格式说明

站点上所有中文内容都是仓库里的 Markdown 与两份 YAML，构建脚本把它们变成页面。
写东西只需要认三样：文件放在哪、frontmatter 写什么、正文怎么写。
构建时会逐条校验：字段缺了、公式写坏了、章节 id 不存在，都会在 `node build.mjs --check-only` 时报错并指出文件名。

---

## 1. 目录

```
content/
  courses.yml                 课程 · 章节 · 小节 · 考纲轮次 · 关键词（站点的骨架）
  taxonomy.yml                大分类与标签（标签页、筛选项都来自这里）
  questions/<course>/<id>.md  题目，一题一个文件
  notes/<course>/<章节>.md    复习要点，一章一个文件
  cheatsheet/<course>.md      速查表（可按轮次拆成 <course>.md + <course>-extra.md）
```

`<course>` 取 `courses.yml` 里的 `id`：`va1`、`la`、`dm1`、`ics`，以及不挂课程的 `other`。

---

## 2. 题目文件

路径示例：`content/questions/va1/va1-001.md`，文件名就是题号。

```markdown
---
course: va1                 # courses.yml 的课程 id
chapter: va1-3              # courses.yml 的章节 id
category: calculus          # taxonomy.yml 的大分类 id
tags: [导数定义, 高阶导数]    # 必须已登记在 taxonomy.yml 的 tags 里
difficulty: 2               # 1–5，5 = 硬核
kind: 计算题                 # 计算题 / 证明题 / 概念题 / 综合题
source: 自编
origin: 自编
answer: \(f^{(n)}(0)=(-1)^{n}n!\)
---

设 \(f(x)=\dfrac{1}{1+x}\)，求 \(f^{(n)}(0)\)。

(1) 第一问；
(2) 第二问。

## 提示

一句话思路（可以只给方向）。

## 解析

完整推导。多行推导用 `\begin{aligned}`，不要用表格写步骤链。

## 常见错误

最常踩的那一个坑。
```

字段规则：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `course` | 是 | 必须是 `courses.yml` 里有的课程 id |
| `chapter` | 是 | 必须是该课程下的小节 id |
| `category` | 推荐 | `taxonomy.yml` 的大分类；不写按课程默认 |
| `tags` | 推荐 | 必须登记在 `taxonomy.yml`，否则构建时提示 |
| `difficulty` | 是 | 整数 1–5 |
| `kind` | 推荐 | 题型 |
| `source` / `origin` | 否 | 出处 |
| `answer` | 是 | 结论本身，一行能写完就一行 |

正文结构固定是「题面 → `## 提示` → `## 解析` → `## 常见错误`」。解析里直接写做法与推导，
不要写「为什么能想到」这类旁白。

---

## 3. 复习要点

路径示例：`content/notes/va1/va1-3.md`。

```markdown
---
course: va1
chapter: va1-3
title: 函数的导数
lead: 导数与微分的定义、可导与可微与连续的关系、求导法则与高阶导数的算法。
---

## 这一章要会什么

- 用定义算导数与单侧导数，尤其是分段函数在分界点的导数
- 判断可导、可微、连续三者的推出关系，并会举反例

## 3.1 导数与微分

### 定义与三种等价写法

正文。

:::theorem
条件：…… 结论：……
:::

什么时候用：……（这类操作提示放块外）

## 常见问法与易错点

- ……
```

要点页会把 `##` 小节列成「本章速览」与右侧目录，所以 `##` 用课本小节号（`## 3.1 …`），
`###` 写具体内容（不要用「定义」「定理」这种泛称）。

---

## 4. 正文语法

### 4.1 公式

- 行内：`\(...\)`
- 行间：`\[ ... \]`
- 站点缩写（构建时展开）：`\e` `\i` `\d` `\abs{}` `\norm{}` `\R` `\N` `\Z` `\Q` `\C` `\rank` `\tr` `\diag` `\sgn` `\eps` `\T`
- 自然常数、微分算子、虚数单位用正体（`\e` `\d` `\i`），转置用 `\T`（渲染成 ⊤）

### 4.2 区块

英文关键词 + 可选标题：

```markdown
:::theorem[拉格朗日中值定理]
若 \(f\) 在 \([a,b]\) 上连续、在 \((a,b)\) 内可导，则存在 \(\xi\) 使 \(f'(\xi)=\dfrac{f(b)-f(a)}{b-a}\)。
:::
```

可用类型：

| 类型 | 显示 | 颜色 |
| --- | --- | --- |
| `definition` | 定义 | 墨色 |
| `theorem` / `lemma` / `proposition` | 定理 / 引理 / 命题 | 墨色 |
| `corollary` / `property` / `conclusion` | 推论 / 性质 / 结论 | 墨色 |
| `example` | 例 | 蓝色 |
| `warning` / `note` / `danger` / `caution` | 注意 | 红色 |
| `tip` / `info` / `remark` | 提示 | 蓝色 |
| `proof` | 证明 | 灰色 |

区块里可以写公式、列表、后续段落；「什么时候用 / 用法」这类操作提示留在块外。

### 4.3 表格与列表

- Markdown 表格只用于真值表、参数表这类**枚举**；表格里的公式用 `\(...\)`
- 步骤链、等值演算、归结过程用 `\begin{aligned}`（序号 / 公式 / 依据三列），分情形用 `\begin{cases}`

### 4.4 代码

````markdown
```c
long f(long x) { return x * 2; }
```
````

代码块里的 `$` 和反斜杠不会被当成公式，可以放心写汇编与 LaTeX 源码。

---

## 5. 速查表

`content/cheatsheet/<course>.md`：

```markdown
---
course: va1
terms: [midterm, final]
---

### 等价无穷小（\(x\to0\)）

\[\sin x\sim x,\quad \tan x\sim x\]
```

- `terms: [midterm, final]` 表示这份内容期中、期末都看
- 期末才有的内容放 `<course>-extra.md`，写 `terms: [final]`；页面会按「期中内容 → 期末补充」排列
- 打印是 A4 横向三栏，一门课一张纸；页面上可以勾选打印哪几门

---

## 6. 课程与范围（courses.yml）

```yaml
terms:
  - id: midterm
    label: 期中
  - id: final
    label: 期末

courses:
  - id: va1
    name: 微积分 A1
    short: 微积分
    accent: ink
    terms: [midterm, final]          # 这门课参加哪几轮
    scope_midterm: 第 1 章 – 第 4.3 节（泰勒公式）
    scope_final: 第 1 章 – 第 7 章（含定积分、广义积分、常微分方程）
    scope_note_midterm: 4.3 节含在内，4.4 节起不在期中范围。
    scope_note_final: 整本书。
    chapters:
      - id: va1-3
        no: "3"
        title: 函数的导数
        state: in
        terms: { midterm: in, final: in }
        sections:
          - no: "3.1"
            title: 导数与微分的概念
            state: in
            terms: { midterm: in, final: in }
            keywords: [导数定义, 单侧导数]
```

- 小节 `terms` 取值：`in` / `boundary`（到此为止）/ `out`
- 章节状态由小节推导：全在 → `in`，部分在 → 部分在范围，都不在 → `out`
- 课程级 `terms: [final]` 表示只有期末（如离散数学 1），期中那一轮整门课都不在范围

---

## 7. 标签（taxonomy.yml）

```yaml
categories:
  - id: calculus
    name: 微积分
    course: va1
  - id: discrete
    name: 离散数学
    course: dm1
tags:
  - 导数定义
  - 泰勒公式
```

题目里用到的 tag 必须先在这里登记；没登记会在构建时报「标签还没有登记」。
新增学科就在 `categories` 里加一项并指定 `course`。

---

## 8. 校验

```bash
node build.mjs --check-only    # 内容校验（不写文件）
node build.mjs                 # 生成 docs/
node scripts/check-links.mjs   # 死链
```

常见报错：

| 报错 | 原因 |
| --- | --- |
| `course 必须是 …` | frontmatter 的 course 不在 courses.yml |
| `chapter「x」不在 courses.yml 里` | 章节 id 写错或课程不对 |
| `标签「x」还没有登记` | 去 taxonomy.yml 补一行 |
| `difficulty 必须是 1–5` | 难度越界 |
| `KaTeX … 处渲染错误` | 公式写坏（构建末尾会列出页面） |
