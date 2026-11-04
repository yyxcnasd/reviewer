---
course: dm
chapter: dm-5
title: 谓词逻辑的等值和推理演算
lead: 否定型与量词分配等值式、前束范式与 Skolem 标准形、基本推理公式、四条量词规则，以及谓词归结与合一。
---
## 5.1 否定型等值式

### 定义

设 \(A,B\) 为一阶谓词公式，若 \(A\leftrightarrow B\) 普遍有效，则称 \(A\) 与 \(B\) 等值，记 \(A=B\) 或 \(A\Leftrightarrow B\)。

### 否定型等值式

\[
\neg(\forall x)P(x)=\exists x\,\neg P(x),\qquad
\neg(\exists x)P(x)=\forall x\,\neg P(x),
\]

由此还有 \((\forall x)P(x)=\neg\exists x\,\neg P(x)\)、\((\exists x)P(x)=\neg\forall x\,\neg P(x)\)。直观说法是：否定词越过量词，量词要翻转。

### 证明方法

有限域法：把量词按 4.5 展开成合取/析取，再用德摩根律；语义解释法：分别从左推右、从右推左，说明两边在同一解释下真值相同。

### 常用变形

\(\neg(\forall x)(A(x)\to B(x))=\exists x(A(x)\land\neg B(x))\)；\(\neg(\exists x)(A(x)\land B(x))=\forall x(A(x)\to\neg B(x))\)。把"并非所有…"变成"存在…不是…"，是自然语句形式化里最常考的一步。

### 易错点

只翻量词不翻否定范围。"\(\neg(\forall x)(A\to B)\)"中的否定作用于整个公式，化到里面时蕴含式也要一起否定；另外 \(\neg\) 越过量词后必须换量词种类，不能两个 \(\forall\) 直接用德摩根。

## 5.2 量词分配等值式

### 与个体变元无关的公式

设 \(q\) 是不含 \(x\) 的公式（命题变项或与 \(x\) 无关的公式），则

\[
(\forall x)(P(x)\lor q)=(\forall x)P(x)\lor q,\qquad
(\forall x)(P(x)\land q)=(\forall x)P(x)\land q,
\]

存在量词同理；蕴含型有

\[
(\forall x)(P(x)\to q)=\exists x P(x)\to q,\qquad
(\forall x)(p\to Q(x))=p\to(\forall x)Q(x),
\]

存在量词同理。这组式子叫量词辖域收缩与扩张。

### 量词对同种联结词的分配

\[
(\forall x)(P(x)\land Q(x))=(\forall x)P(x)\land(\forall x)Q(x),
\]

\[
(\exists x)(P(x)\lor Q(x))=(\exists x)P(x)\lor(\exists x)Q(x).
\]

### 不能分配的情形

\(\forall\) 对 \(\lor\)、\(\exists\) 对 \(\land\) 只满足单向蕴含：

\[
(\forall x)P(x)\lor(\forall x)Q(x)\Rightarrow(\forall x)(P(x)\lor Q(x)),
\]

\[
(\exists x)(P(x)\land Q(x))\Rightarrow(\exists x)P(x)\land(\exists x)Q(x).
\]

反例都在二元域上：令 \(P(1)=1,P(2)=0,Q(1)=0,Q(2)=1\)，则 \((\forall x)(P(x)\lor Q(x))\) 真而 \((\forall x)P(x)\lor(\forall x)Q(x)\) 假。

### 三条等值演算规则

置换规则（子公式等值替换）、换名规则（约束变元改名）、代替规则（自由变元换名）。量词左移前必须先换名，避免把不同辖域的变元混成一个。

### 易错点

把单向蕴含当成等值；用错"与 \(x\) 无关"这个前提（若 \(q\) 里含 \(x\)，辖域不能收缩）；换名时漏改量词。

## 5.3 前束范式

### 定义

若公式 \(A\) 满足：(1) 所有量词都在最左边；(2) 量词前都不含否定词；(3) 每个量词的辖域都延伸到公式末尾，则称 \(A\) 是前束范式。

### 化法四步

1. 消去 \(\to\) 和 \(\leftrightarrow\)（用蕴涵等值式、等价等值式）；
2. 用德摩根律和否定型等值式把 \(\neg\) 内移到原子公式前；
3. 使用量词分配、辖域扩张等值式把量词逐个左移，移之前先换名，保证各量词辖域的变元互不相同；
4. 整理母式（量词后面那部分）。

结论：任何一阶公式都存在等值的前束范式，但**不唯一**（存在量词与全称量词相邻时可以交换顺序，母式也不唯一）。

### Skolem 标准形

只保留全称量词的前束范式叫 Skolem 标准形。做法：按前缀从左到右消去存在量词——若 \(\exists\) 左边没有全称量词，就用一个新常项代入该变元；若左边有全称量词 \(y_1,\dots,y_k\)，就用一个新的 \(k\) 元函数 \(f(y_1,\dots,y_k)\) 代入。

例：\((\forall x)(\exists y)(\forall u)(\exists v)P(x,y,u,v)\) 的 Skolem 标准形是 \((\forall x)(\forall u)P(x,f(x),u,g(x,u))\)。

### 关键性质

一般公式与它的 Skolem 标准形**不等值**，但"不可满足"这个性质保持：原式不可满足当且仅当其 Skolem 标准形不可满足。所以 Skolem 化只能用于归结反证，不能用来做等值变形。

### 易错点

Skolem 函数要依赖它左边**所有**全称量词（漏掉参数是常见错误）；先化前束范式再消存在量词，顺序不能反。

## 5.4 基本推理公式

### 推理形式

谓词逻辑的推理形式仍是 \(A_1\land\cdots\land A_n\to B\)；若它普遍有效，称推理正确，记 \(A_1\land\cdots\land A_n\Rightarrow B\)。命题逻辑的推理公式都可以作为代入实例搬过来。

### 谓词逻辑特有的公式

讲义列了 10 条，最常用的有：

- \((\forall x)(P(x)\to Q(x))\Rightarrow(\forall x)P(x)\to(\forall x)Q(x)\)；
- \((\exists x)(P(x)\land Q(x))\Rightarrow(\exists x)P(x)\land(\exists x)Q(x)\)；
- \((\forall x)P(x)\lor(\forall x)Q(x)\Rightarrow(\forall x)(P(x)\lor Q(x))\)；
- \((\forall x)P(x)\Rightarrow(\forall y)P(y)\)（全称例示）；
- \(P(c)\Rightarrow(\exists x)P(x)\)（存在推广）；
- \((\exists x)(\forall y)P(x,y)\Rightarrow(\forall y)(\exists x)P(x,y)\)。

### 证明方法

解释法（设前件真，推后件真）、反证法、有限域展开验证。注意谓词逻辑不能用真值表。

### 易错点

方向不能反：\(\exists x\forall y\Rightarrow\forall y\exists x\) 成立，反过来不成立；公式里的 \(c\) 是常项，不能换成变元还当成全称结论。

## 5.5 推理演算

### 规则构成

命题逻辑的六条规则（前提引入、结论引入、代入、置换、分离、条件证明）继续可用，另加四条量词规则：

- UI（全称例示）：由 \((\forall x)P(x)\) 得 \(P(y)\) 或 \(P(c)\)。要求 \(y\) 不在 \(P(x)\) 中约束出现，且 \(x\) 自由出现的地方都要替换到；
- UG（全称推广）：由 \(P(y)\) 得 \((\forall x)P(x)\)。要求 \(y\) 是任意的（不是由 EI 引入的特定常项），且 \(x\) 不在 \(P(y)\) 中约束出现；
- EI（存在例示）：由 \((\exists x)P(x)\) 得 \(P(c)\)。要求 \(c\) 是新的特定常项，不在前面出现过，且 \(P(x)\) 中没有其它自由变元；
- EG（存在推广）：由 \(P(c)\) 得 \((\exists x)P(x)\)。

### 套路

先形式化；需要时消去量词（UI、EI）；在无量词的公式上用命题逻辑规则推；最后用 UG、EG 把量词加回去。一般从存在前提入手消去，再从全称前提例示。

### 例题

前提：\((\forall x)(W(x)\to\neg B(x))\)、\((\forall x)(B(x)\lor K(x))\)、\((\exists x)\neg K(x)\)，结论 \((\exists x)\neg W(x)\)。步骤：(1) EI 取 \(c\) 使 \(\neg K(c)\)；(2) UI 得 \(B(c)\lor K(c)\)；(3) 析取三段论得 \(B(c)\)；(4) UI 得 \(W(c)\to\neg B(c)\)，置换为 \(B(c)\to\neg W(c)\)；(5) 分离得 \(\neg W(c)\)；(6) EG 得 \((\exists x)\neg W(x)\)。

### 易错点

EI 用的常项必须是新的（前面出现过就导致"两个存在量词是同一个个体"的偷换）；UG 只能对任意变元做，对 EI 得到的 \(c\) 做 UG 是典型错误；UI 替换时若目标变元在公式中约束出现，会造出假的结论。

## 5.6 谓词逻辑的归结推理法

### 为什么需要它

推理演算靠技巧、不便机器实现；命题归结可推广到谓词逻辑，只是多了量词和变元的处理。

### 步骤

1. 欲证 \(A_1\land\cdots\land A_n\Rightarrow B\)，改证 \(G=A_1\land\cdots\land A_n\land\neg B\) 不可满足；
2. 把 \(G\) 化成前束范式，再化 Skolem 标准形，消去存在量词得到只含全称量词的公式 \(G^*\)（\(G\) 不可满足当且仅当 \(G^*\) 不可满足）；
3. 略去全称量词，把母式的合取式拆成子句，得到子句集 \(S\)；
4. 对 \(S\) 反复归结，直到出现空子句 \(\square\)。

### 合一与归结式

两个子句里的谓词文字往往不能直接构成互补对，需要先做变元替换（合一）：寻找一个替换 \(\theta\)，使得 \(P(t_1,\dots)\) 与 \(P(s_1,\dots)\) 变成同一个原子公式，再与另一子句的否定文字配对。只做必要替换、不作多余限制的合一者叫最一般合一（mgu）。归结式就是消去互补对后剩下的文字的析取。

例：\(C_1=P(x)\lor Q(x)\)，\(C_2=\neg P(a)\lor R(y)\)，取 \(\theta=\{x/a\}\) 后 \(P(a)\) 与 \(\neg P(a)\) 互补，归结式为 \(Q(a)\lor R(y)\)。

### 例题

证 \((\forall x)(P(x)\to Q(x))\Rightarrow(\forall x)P(x)\to(\forall x)Q(x)\)。取 \(G=(\forall x)(\neg P(x)\lor Q(x))\land(\forall x)P(x)\land\exists x\neg Q(x)\)，Skolem 化得 \(\neg Q(a)\)，子句集 \(S=\{\neg P(x)\lor Q(x),\ P(x),\ \neg Q(a)\}\)。\(\neg P(x)\lor Q(x)\) 与 \(P(y)\) 合一（\(\{x/y\}\)）归结得 \(Q(y)\)；\(Q(y)\) 与 \(\neg Q(a)\) 合一（\(\{y/a\}\)）归结得 \(\square\)。

### 易错点

- 归结前必须把子句的变元分开（不同子句用不同变元名），否则"同名变元"会被误当成同一个个体；
- Skolem 化保持的是不可满足性而不是等值性，别写成"\(G\) 与 \(G^*\) 等值"；
- 谓词归结不能与推理演算规则混用（讲义强调过）。
