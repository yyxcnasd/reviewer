---
course: dm1
title: 离散数学1
terms: [final]
---

## 命题逻辑

### 联结词与真值表

优先级 \(\neg>\wedge>\vee>\to>\leftrightarrow\)；取 \(1\) 真、\(0\) 假。

| \(p\) | \(q\) | \(\neg p\) | \(p\wedge q\) | \(p\vee q\) |
| --- | --- | --- | --- | --- |
| 1 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 1 |
| 0 | 0 | 1 | 0 | 0 |

| \(p\) | \(q\) | \(p\to q\) | \(p\leftrightarrow q\) |
| --- | --- | --- | --- |
| 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 0 | 0 | 1 | 1 |

易错：\(p\to q\) 仅在 \(1,0\) 时为假；前件为假时蕴含恒真。

### 等值公式

先消 \(\to,\leftrightarrow\)：\(p\to q=\neg p\vee q\)，\(p\leftrightarrow q=(p\to q)\wedge(q\to p)\)。

\[ \neg\neg p=p,\quad p\vee p=p,\quad p\wedge p=p,\quad p\vee0=p,\quad p\wedge1=p,\quad p\vee1=1,\quad p\wedge0=0 \]
\[ p\vee\neg p=1,\quad p\wedge\neg p=0,\quad p\vee(p\wedge q)=p,\quad p\wedge(p\vee q)=p \]
\[ p\vee q=q\vee p,\quad p\wedge q=q\wedge p,\quad (p\vee q)\vee r=p\vee(q\vee r),\quad (p\wedge q)\wedge r=p\wedge(q\wedge r) \]
\[ p\wedge(q\vee r)=(p\wedge q)\vee(p\wedge r),\quad p\vee(q\wedge r)=(p\vee q)\wedge(p\vee r) \]
\[ \neg(p\wedge q)=\neg p\vee\neg q,\quad \neg(p\vee q)=\neg p\wedge\neg q \]
\[ p\to q=\neg q\to\neg p=\neg(p\wedge\neg q),\quad p\to(q\to r)=(p\wedge q)\to r \]
\[ p\to(q\wedge r)=(p\to q)\wedge(p\to r),\quad p\to(q\vee r)=(p\to q)\vee(p\to r) \]
易错：只能整段替换子公式，化简前先消去 \(\to,\leftrightarrow\)。

### 主析取范式与主合取范式

极小项 \(m_i\)：\(n\) 个变元各出现一次，取真写 \(p\)、取假写 \(\neg p\)，对应二进制数 \(i\)；极大项 \(M_i\) 对偶，\(\neg m_i=M_i\)。

\[ A=\bigvee_{i\in I}m_i=\bigwedge_{j\notin I}M_j, \]

其中 \(I\) 为 \(A\) 的成真赋值集合。求法：消蕴含 → 内移 \(\neg\) → 分配化成析取（合取）范式 → 缺变元用 \(p\vee\neg p\)（或 \(p\wedge\neg p\)）补齐、按编号排序。易错：\(m_i\) 与 \(M_i\) 用同一套编号，补项时漏变元。

### 联结词完备集

\(\{\neg,\wedge,\vee\}\) 完备；\(\{\neg,\wedge\},\{\neg,\vee\},\{\neg,\to\}\) 完备；单元素 \(\{\uparrow\}\)（与非）、\(\{\downarrow\}\)（或非）完备；\(\{\wedge,\vee\}\) 不完备（保持全 0 赋值结果仍为 0，表示不出 \(\neg\)）。判不完备：找所有联结词都保持的性质。

### 推理规则

| 名称 | 形式 |
| --- | --- |
| 假言推理 | \(p,\ p\to q\Rightarrow q\) |
| 拒取式 | \(\neg q,\ p\to q\Rightarrow\neg p\) |
| 析取三段论 | \(p\vee q,\ \neg p\Rightarrow q\) |
| 假言三段论 | \(p\to q,\ q\to r\Rightarrow p\to r\) |
| 化简 | \(p\wedge q\Rightarrow p\) |
| 附加 | \(p\Rightarrow p\vee q\) |
| 合取 | \(p,\ q\Rightarrow p\wedge q\) |
| 构造性二难 | \(p\to q,\ r\to s,\ p\vee r\Rightarrow q\vee s\) |

易错：\(\Rightarrow\) 是「前提成立则结论必成立」，不是等值。

### 推理演算的三种方法

真值表法：前提全真的行上 \(Q\) 也为真；变元不超过 3 个时最快。等值演算法：证 \((P_1\wedge\cdots\wedge P_n)\to Q\) 为永真式。自然推理法：用推理规则推出 \(Q\)，可用 CP（附加结论前件）或归谬（加入 \(\neg Q\) 推出矛盾）。易错：真值表只看前提为真的行。

### 归结反演

证 \(P_1,\dots,P_n\vdash Q\)：把 \(P_1,\dots,P_n,\neg Q\) 化成子句集，对含互补文字的两子句归结，推出空子句 \(\square\) 即证。步骤：消蕴含 → 内移 \(\neg\) → 合取范式取子句 → 归结。命题逻辑中不可满足必能推出 \(\square\)。易错：漏写 \(\neg Q\)。

## 谓词逻辑

### 量词否定与分配

\[ \neg\forall xP(x)=\exists x\neg P(x),\qquad \neg\exists xP(x)=\forall x\neg P(x) \]
\[ \forall x(P(x)\wedge Q(x))=\forall xP(x)\wedge\forall xQ(x),\qquad \exists x(P(x)\vee Q(x))=\exists xP(x)\vee\exists xQ(x) \]
单向成立、反向不成立：
\[ \forall xP(x)\vee\forall xQ(x)\Rightarrow\forall x(P(x)\vee Q(x)),\qquad \exists x(P(x)\wedge Q(x))\Rightarrow\exists xP(x)\wedge\exists xQ(x) \]
反例（整数）：\(P\) 偶、\(Q\) 奇，\(\forall x(P\vee Q)\) 真而 \(\forall xP\)、\(\forall xQ\) 都假。若 \(Q\) 不含 \(x\)：\(\forall x(P\vee Q)=\forall xP\vee Q\)，\(\exists x(P\wedge Q)=\exists xP\wedge Q\)。易错：\(\forall\) 不能对 \(\vee\) 分配。

### 前束范式

形如 \(Q_1x_1Q_2x_2\cdots Q_nx_nM\)（\(M\) 不含量词），存在且不唯一。化法：消 \(\to,\leftrightarrow\) → 用德摩根与量词否定内移 \(\neg\) → 约束变元换名 → 量词逐个前移。易错：换名不能省，否则前移会把自由变元约束掉。

### 谓词推理规则

- UI：\(\forall xP(x)\Rightarrow P(c)\)，\(c\) 任意。
- UG：\(P(c)\Rightarrow\forall xP(x)\)，要求 \(c\) 任意（无特殊假设、不在前提中自由出现）。
- EI：\(\exists xP(x)\Rightarrow P(c)\)，要求 \(c\) 是全新常元。
- EG：\(P(c)\Rightarrow\exists xP(x)\)，\(c\) 任意。

易错：同时用 UI 与 EI 时先 EI 后 UI。

### Skolem 化、合一与归结

Skolem 化：消 \(\to,\leftrightarrow\) → \(\neg\) 内移 → 变元标准化 → 前束范式 → 消 \(\exists\)（前无 \(\forall\) 用新常元，前有 \(\forall x_1\cdots\forall x_n\) 用 Skolem 函数 \(f(x_1,\dots,x_n)\)）→ 删 \(\forall\) → 合取范式，每个合取项为子句。

合一：求代换 \(\sigma\) 使两原子公式相同；mgu 用差异集法，从左找第一处不同，若一为变元且不出现在另一项中则代换。例：\(P(x,f(y))\) 与 \(P(a,z)\) 的 mgu 为 \(\{x/a,\ z/f(y)\}\)。

归结：\(C_1\) 含 \(L\)、\(C_2\) 含 \(\neg L\) 时，\((C_1-\{L\})\cup(C_2-\{\neg L\})\) 为归结式；出空子句说明不可满足。易错：先合一再归结。

## 公理系统

### 罗素公理系统

以 \(\neg,\vee\) 为初始联结词，四条公理：
\[ \begin{aligned}
A_1&:(p\vee p)\to p,\\
A_2&:p\to(p\vee q),\\
A_3&:(p\vee q)\to(q\vee p),\\
A_4&:(q\to r)\to((p\vee q)\to(p\vee r)).
\end{aligned} \]

其余联结词用定义：\(p\to q:=\neg p\vee q\)，\(p\wedge q:=\neg(\neg p\vee\neg q)\)，\(p\leftrightarrow q:=(p\to q)\wedge(q\to p)\)。规则：MP（由 \(A\)、\(A\to B\) 得 \(B\)）；代入规则（变元统一替换）。\(\vdash A\) 表示 \(A\) 是定理；系统可靠且完备（可证公式恰好是永真式）。易错：代入必须统一替换同一变元的所有出现。

### 演绎定理

\[ \Gamma\cup\{A\}\vdash B\quad\Longleftrightarrow\quad\Gamma\vdash A\to B. \]

用法：证 \(A\to B\) 时把 \(A\) 作附加前提推出 \(B\)；反向由 \(\Gamma\vdash A\to B\) 与 \(\Gamma\vdash A\) 用 MP 得 \(B\)。易错：附加前提只在推出 \(B\) 的过程使用，最后要收回成蕴含式。
