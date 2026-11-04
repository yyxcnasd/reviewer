---
course: dm
title: 离散数学
---

## 命题逻辑

### 五个联结词与真值表

结论：否定 \(\neg\)、合取 \(\wedge\)、析取 \(\vee\)、蕴含 \(\to\)、等价 \(\leftrightarrow\)，取 \(1\) 为真、\(0\) 为假，真值表为

\[
\begin{array}{cc|c|c|c|c|c}
p&q&\neg p&p\wedge q&p\vee q&p\to q&p\leftrightarrow q\\ \hline
1&1&0&1&1&1&1\\
1&0&0&0&1&0&0\\
0&1&1&0&1&1&0\\
0&0&1&0&0&1&1
\end{array}
\]

条件与读法：\(p\to q\) 只在 \(p\) 真、\(q\) 假时为假，其余全真；\(p\leftrightarrow q\) 在两者同真同假时为真。优先级从高到低是 \(\neg,\wedge,\vee,\to,\leftrightarrow\)，同级从左到右。

例：\(p=1,q=0,r=0\) 时，\(p\to q=0\)，所以 \((p\to q)\to r=1\)；而 \(p\to(q\to r)=p\to1=1\)。

### 等值公式

结论：下面全是永真等值式，可以逐项替换，做化简时先把 \(\to,\leftrightarrow\) 换成 \(\neg,\vee,\wedge\)。

\[
\neg\neg p=p,\qquad p\vee p=p,\qquad p\wedge p=p
\]

\[
p\vee q=q\vee p,\qquad p\wedge q=q\wedge p
\]

\[
p\vee(q\vee r)=(p\vee q)\vee r,\qquad p\wedge(q\wedge r)=(p\wedge q)\wedge r
\]

\[
p\wedge(q\vee r)=(p\wedge q)\vee(p\wedge r),\qquad p\vee(q\wedge r)=(p\vee q)\wedge(p\vee r)
\]

\[
\neg(p\wedge q)=\neg p\vee\neg q,\qquad \neg(p\vee q)=\neg p\wedge\neg q
\]

\[
p\vee(p\wedge q)=p,\qquad p\wedge(p\vee q)=p
\]

\[
p\vee0=p,\quad p\wedge1=p,\quad p\vee1=1,\quad p\wedge0=0,\quad p\vee\neg p=1,\quad p\wedge\neg p=0
\]

蕴含与等价的等值式（考得最多）：

\[
p\to q=\neg p\vee q,\qquad p\leftrightarrow q=(p\to q)\wedge(q\to p)
\]

\[
p\to q=\neg q\to\neg p,\qquad p\to q=\neg(p\wedge\neg q)
\]

\[
p\to(q\wedge r)=(p\to q)\wedge(p\to r),\qquad p\to(q\vee r)=(p\to q)\vee(p\to r)
\]

\[
(p\to r)\wedge(q\to r)=(p\vee q)\to r,\qquad p\to(q\to r)=(p\wedge q)\to r
\]

条件：变量取任意真值都成立，与变量个数无关；每步只能用一个等值式替换子公式。

例：化简 \(p\vee(\neg p\wedge q)\)：

\[
p\vee(\neg p\wedge q)=(p\vee\neg p)\wedge(p\vee q)=1\wedge(p\vee q)=p\vee q.
\]

### 主析取范式与主合取范式

定义：极小项是 \(n\) 个变元各出现一次（本身或否定）的合取式，把变元按固定顺序排列，取真写 \(p\)、取假写 \(\neg p\)，得到的二进制数 \(i\) 记该极小项为 \(m_i\)；极大项是对偶的析取式，取真写 \(\neg p\)、取假写 \(p\)，记 \(M_i\)，且 \(\neg m_i=M_i\)。

结论：任何 \(n\) 元公式都有唯一的主析取范式与主合取范式，

\[
A=\bigvee_{i\in I}m_i,\qquad A=\bigwedge_{j\notin I}M_j,
\]

其中 \(I\) 是 \(A\) 的成真赋值对应的极小项编号集合。

求法四步：① 用蕴含、等价等值式消去 \(\to\) 与 \(\leftrightarrow\)；② 用德摩根律把 \(\neg\) 内移到变元前；③ 用分配律化成析取范式（或合取范式）；④ 缺变元的项用 \(p\vee\neg p\)（或 \(p\wedge\neg p\)）补齐后展开，合并同类项、按编号排序。

例：\(p\to q\) 的成真赋值是 \(00,01,11\)，故主析取范式为 \(m_0\vee m_1\vee m_3\)；成假赋值只有 \(10\)，故主合取范式为 \(M_2=\neg p\vee q\)，与 \(p\to q=\neg p\vee q\) 一致。

### 联结词完备集

定义：若任意真值函数都能只用 \(S\) 中的联结词表示，称 \(S\) 为完备集。

结论：\(\{\neg,\wedge,\vee\}\) 完备；\(\{\neg,\wedge\}\)、\(\{\neg,\vee\}\)、\(\{\neg,\to\}\) 都完备；单元素集 \(\{\uparrow\}\)（与非）与 \(\{\downarrow\}\)（或非）也完备；\(\{\wedge,\vee\}\) 不完备，因为二者都保持“全 \(0\) 赋值结果仍为 \(0\)”，表示不出否定。

例：只用与非表示（\(p\uparrow q=\neg(p\wedge q)\)）：

\[
\neg p=p\uparrow p,\qquad p\wedge q=(p\uparrow q)\uparrow(p\uparrow q),\qquad p\vee q=(p\uparrow p)\uparrow(q\uparrow q).
\]

条件：验证完备性可用“能表示 \(\neg\) 与 \(\wedge\)（或 \(\neg\) 与 \(\vee\)）”；验证不完备性找一个所有联结词都保持的性质作反例。

### 推理规则

结论：常用规则如下，记号 \(A_1,\dots,A_k\Rightarrow B\) 表示“由左边可推出右边”。

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
| 等价三段论 | \(p\leftrightarrow q,\ q\leftrightarrow r\Rightarrow p\leftrightarrow r\) |

条件：每条规则只要求前提成立，结论必成立；前提可以有多条，用逗号隔开。

例：前提 \(p\to q\)、\(q\to r\)、\(p\)。由 \(p\) 与 \(p\to q\) 用假言推理得 \(q\)，再由 \(q\) 与 \(q\to r\) 得 \(r\)。

### 推理演算的三种方法

结论：判断 \(P_1,\dots,P_n\vdash Q\)（前提推出结论）有三种做法。

① 真值表法：列 \(P_1\wedge\cdots\wedge P_n\) 与 \(Q\) 的真值表，所有使前提为真的行上 \(Q\) 都为真，则推理有效。变元不超过 \(3\) 个时最快。

② 等值演算法：证 \((P_1\wedge\cdots\wedge P_n)\to Q\) 是永真式——用等值公式化成 \(1\)，或求它的主析取范式看是否含全部极小项。

③ 自然推理法：从前提出发，按推理规则逐条推出结论，最后一条是 \(Q\)。允许用附加前提（CP）：要证 \(A\to B\)，把 \(A\) 加入前提推出 \(B\) 即可；也可用归谬：把 \(\neg Q\) 加入前提推出矛盾。

例（自然推理）：前提 \(p\to q\)、\(\neg q\vee r\)、\(\neg r\)，证 \(\neg p\)。由 \(\neg q\vee r\) 与 \(\neg r\) 用析取三段论得 \(\neg q\)；由 \(\neg q\) 与 \(p\to q\) 用拒取式得 \(\neg p\)。

### 归结反演

结论：要证 \(P_1,\dots,P_n\vdash Q\)，把 \(P_1,\dots,P_n,\neg Q\) 化成子句集，反复归结，推出空子句 \(\square\) 即证；推不出空子句则不能断定结论（命题逻辑中若子句集不可满足，一定能推出空子句）。

步骤：① 消去 \(\to\) 与 \(\leftrightarrow\)；② 把 \(\neg\) 内移；③ 化成合取范式，每个合取项是一个子句（文字的析取）；④ 两个子句含互补文字 \(L\) 与 \(\neg L\) 时，删去它们、合并其余文字得归结式；⑤ 出现空子句即原子句集不可满足。

例：前提 \(p\to q\)、\(q\to r\)，证 \(p\to r\)。否定结论得 \(p\wedge\neg r\)，子句集为

\[
\{\neg p\vee q,\ \neg q\vee r,\ p,\ \neg r\}.
\]

\(\neg p\vee q\) 与 \(p\) 归结得 \(q\)；\(q\) 与 \(\neg q\vee r\) 归结得 \(r\)；\(r\) 与 \(\neg r\) 归结得 \(\square\)，证毕。

## 谓词逻辑

### 量词否定与量词分配

结论（否定）：否定穿过量词时量词翻转，

\[
\neg\forall xP(x)=\exists x\neg P(x),\qquad \neg\exists xP(x)=\forall x\neg P(x).
\]

结论（分配）：下面两条对任意谓词都成立，

\[
\forall x(P(x)\wedge Q(x))=\forall xP(x)\wedge\forall xQ(x),\qquad
\exists x(P(x)\vee Q(x))=\exists xP(x)\vee\exists xQ(x).
\]

单向成立、反向不成立的：

\[
\forall xP(x)\vee\forall xQ(x)\Rightarrow\forall x(P(x)\vee Q(x)),\qquad
\exists x(P(x)\wedge Q(x))\Rightarrow\exists xP(x)\wedge\exists xQ(x).
\]

反例（论域为整数）：\(P(x)\) 表示“\(x\) 是偶数”、\(Q(x)\) 表示“\(x\) 是奇数”，则 \(\forall x(P(x)\vee Q(x))\) 真，但 \(\forall xP(x)\) 与 \(\forall xQ(x)\) 都假；又 \(\exists x(x>0)\) 与 \(\exists x(x<0)\) 都真，却没有整数同时大于 \(0\) 且小于 \(0\)。

条件：若 \(Q\) 中不含 \(x\)，则 \(\forall x(P(x)\vee Q)=\forall xP(x)\vee Q\)，\(\exists x(P(x)\wedge Q)=\exists xP(x)\wedge Q\)；含 \(x\) 时不能这样提。

### 前束范式

定义：形如 \(Q_1x_1Q_2x_2\cdots Q_nx_nM\) 的公式，其中每个 \(Q_i\) 是 \(\forall\) 或 \(\exists\)，\(M\) 不含量词，称为前束范式。

结论：任何谓词公式都等值于一个前束范式，且不唯一。

化法四步：① 消去 \(\to\) 与 \(\leftrightarrow\)；② 用德摩根律与量词否定把 \(\neg\) 内移到原子公式前；③ 约束变元换名，使不同量词的变元、自由变元互不同名；④ 用量词辖域扩张与分配律把量词逐个移到最前面。

例：\(\neg\exists xP(x)\wedge\forall yQ(y)=\forall x\neg P(x)\wedge\forall yQ(y)=\forall x\forall y(\neg P(x)\wedge Q(y))\)。

条件：换名那一步不能省——若量词辖域内外的变元同名，直接移量词会把自由变元约束掉。

### 谓词推理规则

结论（四条，UI/UG/EI/EG）：

- UI（全称实例化）：\(\forall xP(x)\Rightarrow P(c)\)，\(c\) 为论域中任意个体常元。
- UG（全称泛化）：\(P(c)\Rightarrow\forall xP(x)\)，要求 \(c\) 是任意的：证明中没有对 \(c\) 作特殊假设，\(c\) 也不在前提中自由出现。
- EI（存在实例化）：\(\exists xP(x)\Rightarrow P(c)\)，要求 \(c\) 是全新常元，此前从未出现过。
- EG（存在泛化）：\(P(c)\Rightarrow\exists xP(x)\)，\(c\) 任意。

条件：同时要用 UI 与 EI 时先 EI 后 UI，否则随便先 UI 会把可用的常元用掉，EI 就找不到“新”常元。

例：前提 \(\forall x(P(x)\to Q(x))\)、\(\exists xP(x)\)，证 \(\exists xQ(x)\)。先 EI 取新常元 \(c\) 使 \(P(c)\)；再 UI 得 \(P(c)\to Q(c)\)；假言推理得 \(Q(c)\)；最后 EG 得 \(\exists xQ(x)\)。

### Skolem 化、合一与归结

Skolem 化（把公式化成子句集）：① 消去 \(\to,\leftrightarrow\)；② \(\neg\) 内移；③ 变元标准化（换名）；④ 量词前移成前束范式；⑤ 消去存在量词——若 \(\exists\) 前无全称量词，用新常元 \(c\)，若有 \(\forall x_1\cdots\forall x_n\)，用 Skolem 函数 \(f(x_1,\dots,x_n)\)；⑥ 删去全称量词；⑦ 化成合取范式，每个合取项是一个子句。

合一：求代换 \(\sigma\) 使两个原子公式变成同一个。最一般合一（mgu）用差异集法：从左到右找第一处不同的子项，若其中一个是变元且不出现在另一项中，就作代换，重复到无差异为止。

例：\(P(x,f(y))\) 与 \(P(a,z)\) 的 mgu 是 \(\sigma=\{x/a,\ z/f(y)\}\)。

归结：子句 \(C_1\) 含 \(L\)、\(C_2\) 含 \(\neg L\) 时，\((C_1-\{L\})\cup(C_2-\{\neg L\})\) 是归结式；归结到空子句说明子句集不可满足。

例：\(P(x)\vee Q(x)\) 与 \(\neg P(a)\) 取 \(\sigma=\{x/a\}\) 归结得 \(Q(a)\)。

## 命题逻辑的公理系统

### 罗素公理系统

结论：以 \(\neg,\vee\) 为初始联结词，罗素公理系统的四条公理是

\[
\begin{aligned}
A_1&:(p\vee p)\to p,\\
A_2&:p\to(p\vee q),\\
A_3&:(p\vee q)\to(q\vee p),\\
A_4&:(q\to r)\to((p\vee q)\to(p\vee r)),
\end{aligned}
\]

其余联结词用定义引入：\(p\to q\) 定义为 \(\neg p\vee q\)，\(p\wedge q\) 定义为 \(\neg(\neg p\vee\neg q)\)，\(p\leftrightarrow q\) 定义为 \((p\to q)\wedge(q\to p)\)。

推理规则两条：分离规则（MP）——由 \(A\) 与 \(A\to B\) 得 \(B\)；代入规则——公理或已证定理中的命题变元可用任意公式统一替换。

条件：证明是从公理出发反复用这两条规则得到的公式序列，末项就是定理，记 \(\vdash A\)；由前提集 \(\Gamma\) 出发则记 \(\Gamma\vdash A\)。该系统可靠且完备：可证公式恰好是永真式。

例：要证 \(\vdash p\to p\)，用下一小节的演绎定理：把 \(p\) 作附加前提，由前提本身得 \(p\)，故 \(\vdash p\to p\)。

### 演绎定理

结论：对任意公式集 \(\Gamma\) 与公式 \(A,B\)，

\[
\Gamma\cup\{A\}\vdash B\quad\Longleftrightarrow\quad\Gamma\vdash A\to B.
\]

用法：要证一个蕴含式 \(A\to B\)，把 \(A\) 当附加前提加入，推出 \(B\) 即可；反过来，由 \(\Gamma\vdash A\to B\) 与 \(\Gamma\vdash A\)，用分离规则得 \(\Gamma\vdash B\)。

例：证 \(p\to q,\ q\to r\vdash p\to r\)。附加前提 \(p\)，由 \(p\to q\) 得 \(q\)，由 \(q\to r\) 得 \(r\)，再用演绎定理得 \(p\to r\)；整个证明只用了分离规则两次。
