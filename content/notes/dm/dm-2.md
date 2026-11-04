---
course: dm
chapter: dm-2
title: 命题逻辑的等值和推理演算
lead: 等值定理与常用等值公式、真值表与主范式、联结词完备集、对偶式，以及推理演算和归结推理。
---
## 2.1 等值定理

### 定义

设 \(A,B\) 为两个命题公式，若 \(A\leftrightarrow B\) 是重言式，则称 \(A\) 与 \(B\) 等值，记作 \(A=B\)。

### 定理（等值定理）

\(A=B\) 的充分必要条件是 \(A\leftrightarrow B\) 为重言式。

用法：要证两个公式等值，可以证 \(A\leftrightarrow B\) 是重言式（真值表或等值演算）；反过来，已知等值也能说明对应的双条件式重言。

等值关系满足自反性、对称性、传递性。附带两条常用结论：原命题与逆否命题等值，即 \(P\to Q=\neg Q\to\neg P\)；逆命题与否命题等值，即 \(Q\to P=\neg P\to\neg Q\)。

## 2.2 等值公式

### 置换规则

设 \(X\) 是公式 \(A\) 的子公式，用与 \(X\) 等值的公式 \(Y\) 替换 \(A\) 中的 \(X\)，所得公式与 \(A\) 等值（定理 2.2.1）。这是等值演算"可以局部替换"的依据。

### 基本的等值公式

必须背到能默写：双重否定律 \(\neg\neg P=P\)；结合律；交换律；分配律 \(P\lor(Q\land R)=(P\lor Q)\land(P\lor R)\)、\(P\land(Q\lor R)=(P\land Q)\lor(P\land R)\)；等幂律；吸收律 \(P\lor(P\land Q)=P\)、\(P\land(P\lor Q)=P\)；德摩根律 \(\neg(P\lor Q)=\neg P\land\neg Q\)、\(\neg(P\land Q)=\neg P\lor\neg Q\)；同一律；零律；补余律 \(P\lor\neg P=T\)、\(P\land\neg P=F\)。

### 常用的等值公式

- 蕴涵等值式 \(P\to Q=\neg P\lor Q\)（最重要，几乎所有化简第一步都用它）；
- 前提合取合并 \(P\to(Q\to R)=(P\land Q)\to R\)；
- 等价等值式 \(P\leftrightarrow Q=(P\to Q)\land(Q\to P)\)；
- 假言易位 \(P\to Q=\neg Q\to\neg P\)；
- 归谬论 \((P\to Q)\land(P\to\neg Q)=\neg P\)；
- 前提交换 \(P\to(Q\to R)=Q\to(P\to R)\)，前提析取合并 \((P\to R)\land(Q\to R)=(P\lor Q)\to R\)。

### 最容易错的一步

\(\to\) 不满足交换律、结合律和分配律，\(\leftrightarrow\) 不满足分配律。\(\neg(P\to Q)=P\land\neg Q\)，\(\neg(P\leftrightarrow Q)=(P\land\neg Q)\lor(\neg P\land Q)\)，这两条常写错。分配律两个方向都要会，别当成算术里的"只能乘开"。

## 2.3 命题公式与真值表的关系

### 从取 1 的行写主析取范式

真值表中取 1 的行共 \(m\) 行，则 \(A=Q_1\lor Q_2\lor\cdots\lor Q_m\)，其中每行对应一个极小项：该行 \(P_i=1\) 就取 \(P_i\)，\(P_i=0\) 就取 \(\neg P_i\)，全部合取起来。极小项编号等于该行真值组成的二进制数的十进制值，记 \(m_i\)。

### 从取 0 的行写主合取范式

取 0 的行共 \(k\) 行，则 \(A=Q_1\land\cdots\land Q_k\)，每行对应一个极大项，规则与极小项**相反**：该行 \(P_i=1\) 取 \(\neg P_i\)，\(P_i=0\) 取 \(P_i\)，全部析取起来，记 \(M_j\)。

### 定理（主范式存在唯一性）

任一含 \(n\) 个命题变项的公式，都存在唯一与之等值、且恰好只含这 \(n\) 个变项的主析取范式，也存在唯一的主合取范式。

### 求法与用途

求主范式两条路：(1) 先化出析取范式（或合取范式），再用 \(P=P\land(Q\lor\neg Q)\) 补满变项；(2) 直接列真值表读。主析取范式中极小项的个数就是成真赋值的个数；含全部 \(2^n\) 个极小项当且仅当重言式；一个极小项都不含当且仅当矛盾式。永真式的主合取范式、矛盾式的主析取范式都约定为空公式。主析取与主合取可以互转：下标集合在 \(\{0,1,\dots,2^n-1\}\) 中取补。

### 易错点

- 化简后的析取范式中每项必须恰好含全部 \(n\) 个变项（每个变项与其否定恰出现一次）才是主析取范式；
- 互转时补集别补错，\(n\) 变项的下标范围是 \(0\) 到 \(2^n-1\)；
- \(m_i\) 与 \(M_i\) 的真值正好相反：\(M_i\) 只在第 \(i\) 行取 0。

## 2.4 联结词的完备集

### 定义

\(n\) 个命题变元可定义 \(2^{2^n}\) 个 \(n\) 元真值函项。若任一真值函项都能只用集合 \(C\) 中的联结词表示，称 \(C\) 为联结词的完备集。

### 定理与推论

\(\{\neg,\land,\lor\}\) 是完备集（因为任一公式都能按真值表列写）。推论：\(\{\neg,\land\}\)、\(\{\neg,\lor\}\)、\(\{\neg,\to\}\)、\(\{\uparrow\}\)（与非）、\(\{\downarrow\}\)（或非）都完备。单独一个 \(\uparrow\) 或 \(\downarrow\) 就够，这在集成电路里有直接应用。

证法：把 \(\neg,\land,\lor\) 逐个用目标集表示。例如用与非表示：\(\neg P=P\uparrow P\)，\(P\land Q=(P\uparrow Q)\uparrow(P\uparrow Q)\)，\(P\lor Q=(P\uparrow P)\uparrow(Q\uparrow Q)\)。

### 不完备的例子

\(\{\neg\}\)、\(\{\land\}\)、\(\{\lor\}\)、\(\{\land,\lor\}\)、\(\{\to\}\)、\(\{\neg,\leftrightarrow\}\) 都不完备。理由要会挑一个说：\(\{\land,\lor\}\) 只能表示单调函数，表达不出否定；\(\{\neg,\leftrightarrow\}\) 生成的函数都是仿射函数（模 2 意义下形如 \(a_1x_1\oplus\cdots\oplus a_nx_n\oplus c\)），而 \(\land\) 不是。

## 2.5 对偶式

### 定义

对只含 \(\land,\lor,\neg\) 的公式 \(A\)，把其中的 \(\land\) 与 \(\lor\) 互换、\(T\) 与 \(F\) 互换，得到的公式 \(A^*\) 叫 \(A\) 的对偶式。再把 \(A\) 中每个命题变项都换成它的否定得到的公式记作 \(A^-\)。

### 定理（对偶原理）

\((A^*)^*=A\)；\(\neg(A^*)=(\neg A)^*\)；\(\neg A=A^{*-}\)；若 \(A=B\)，则 \(A^*=B^*\)；若 \(A\to B\) 永真，则 \(B^*\to A^*\) 永真。由这些可以推出：\(A\) 与 \(A^-\) 同永真、同可满足；重言式的对偶式是矛盾式。

### 易错点

- 对偶只换 \(\land,\lor\) 和 \(T,F\)，**不换** \(\neg\)；
- 公式里若还有 \(\to\) 或 \(\leftrightarrow\)，先化成只含 \(\land,\lor,\neg\) 的形式再求对偶；
- 对偶原理说的是"等值关系整体翻过去"，不是把某一边单独取对偶。

## 2.6 范式

### 定义

命题变项及其否定统称文字；由文字组成的合取式叫简单合取式，析取式叫简单析取式。形如 \(A_1\lor\cdots\lor A_n\)（每个 \(A_i\) 是合取式）的叫析取范式；形如 \(A_1\land\cdots\land A_n\)（每个 \(A_i\) 是析取式）的叫合取范式。

### 定理

任一命题公式都存在与之等值的析取范式和合取范式，但都不唯一（这就是要引入主范式的原因）。

### 求法

1. 用蕴涵等值式、等价等值式消去 \(\to\) 和 \(\leftrightarrow\)；
2. 用德摩根律把 \(\neg\) 内移到命题变项前面；
3. 用分配律、吸收律、等幂律整理成析取范式或合取范式。

### 易错点

范式不唯一，检查时不能拿"和我算的不一样"当错；主范式才唯一。补变项时别漏掉已经出现的变项，也不要把析取范式直接当主析取范式。

## 2.7 推理形式

### 定义

把自然语言推理抽象成 \(A_1\land A_2\land\cdots\land A_n\to B\)，叫推理形式；若该蕴含式永真，称推理正确，记 \(A_1\land\cdots\land A_n\Rightarrow B\)，读作重言蕴涵。

### 关键区分

\(\Rightarrow\) 不是联结词，\(A\Rightarrow B\) 与 \(A\to B\) 不是一回事：前者是"关于公式的判断"，后者是公式。三个等价说法要会互换：\(A\Rightarrow B\)、\(A\to B\) 是重言式、\(A\land\neg B\) 是矛盾式。

### 性质

若 \(A\Rightarrow B\) 且 \(B\Rightarrow C\)，则 \(A\Rightarrow C\)；\(A\Rightarrow B\) 且 \(B\Rightarrow A\) 当且仅当 \(A=B\)；若 \(A\Rightarrow B\) 且 \(A\) 是重言式，则 \(B\) 是重言式；\(A\Rightarrow B\) 且 \(A\Rightarrow C\) 得 \(A\Rightarrow B\land C\)；\(A\Rightarrow C\) 且 \(B\Rightarrow C\) 得 \(A\lor B\Rightarrow C\)。

注意 \(A\) 不能恒假：若 \(A\) 永假，\(A\to B\) 固然永真，这样的"推理"没有意义。

## 2.8 基本的推理公式

### 必须记住的几条

化简 \(P\land Q\Rightarrow P\)；附加 \(P\Rightarrow P\lor Q\)；假言推理（分离）\(P\land(P\to Q)\Rightarrow Q\)；拒取式 \(\neg Q\land(P\to Q)\Rightarrow\neg P\)；析取三段论 \(\neg P\land(P\lor Q)\Rightarrow Q\)；假言三段论 \((P\to Q)\land(Q\to R)\Rightarrow P\to R\)；二难推理 \((P\to R)\land(Q\to R)\land(P\lor Q)\Rightarrow R\)；\((P\to Q)\land(R\to S)\land(P\lor R)\Rightarrow Q\lor S\)。讲义共列 16 条，其余可由这几条代入变形得到。

### 证明 \(A\Rightarrow B\) 的方法

证 \(A\to B\) 是重言式；证 \(A\land\neg B\) 是矛盾式；真值表法；反证法（证 \(\neg B\Rightarrow\neg A\)）；解释法。

### 易错点

\(P\lor Q\Rightarrow P\) 不成立，别把析取当合取化简；公式使用前先核对它要求的前提是否都已具备。

## 2.9 推理演算

### 六条推理规则

前提引入、结论引入、代入（仅用于重言式中的命题变项）、置换（利用等值公式替换子公式）、分离（由 \(A\) 与 \(A\to B\) 得 \(B\)）、条件证明（\(A_1\land A_2\Rightarrow B\) 与 \(A_1\Rightarrow A_2\to B\) 等价）。

### 套路

1. 把要证的蕴含式写成"前提 \(\Rightarrow\) 结论"；结论是蕴含式时，把它的前件作为附加前提引入，最后用条件证明规则收口；
2. 结论是否定式、或前提里有析取时，常用归谬法：把结论的否定作附加前提，推出矛盾；
3. 看到 \(P\lor Q\) 就置换成 \(\neg P\to Q\)，往往立刻能用三段论或分离。

### 例题

证明 \((P\lor Q)\land(P\to R)\land(Q\to S)\Rightarrow S\lor R\)。步骤：(1) \(P\lor Q\) 置换为 \(\neg P\to Q\)；(2) 用 \((Q\to S)\) 得 \(\neg P\to S\)（三段论）；(3) 置换为 \(\neg S\to P\)；(4) 与 \(P\to R\) 三段论得 \(\neg S\to R\)；(5) 置换回 \(S\lor R\)。每一步都注明依据（前提引入/置换/三段论/分离）。

### 易错点

- 附加前提引入后，结论必须"撤销"这个假设写成蕴含式，不能把它当前提直接用；
- 代入规则只能作用于重言式里的命题变项，不能对一般公式随意代入；
- 推理演算与归结推理是两套方法，同一道题里不能混用（讲义专门强调过）。

## 2.10 归结推理法

### 基本概念

子句是文字的析取式；把合取范式写成子句集合叫子句集；空子句记 \(\square\)，代表矛盾。若子句 \(C_1=L\lor C_1'\)，\(C_2=\neg L\lor C_2'\)，消去互补对得到的 \(C_1'\lor C_2'\) 叫 \(C_1,C_2\) 的归结式，且 \(C_1\land C_2\Rightarrow R(C_1,C_2)\)。

### 步骤

1. 欲证 \(A\Rightarrow B\)，改写为证 \(A\land\neg B\) 是矛盾式；
2. 把 \(A\land\neg B\) 化成合取范式，得到子句集 \(S\)；
3. 反复对 \(S\) 中的子句作归结，归结式仍放进 \(S\)；
4. 直到归结出空子句 \(\square\)，证明结束。

### 例题

证 \((P\to Q)\land P\Rightarrow Q\)。子句集 \(S=\{\neg P\lor Q,\ P,\ \neg Q\}\)；\(\neg P\lor Q\) 与 \(P\) 归结得 \(Q\)；\(Q\) 与 \(\neg Q\) 归结得 \(\square\)。

### 易错点

- 起点是 \(A\land\neg B\)，不是 \(A\lor\neg B\)，也不是只取 \(\neg B\)；
- 归结式加入 \(S\)，原子句保留（可重复使用），不要删；
- 归结出 \(\square\) 才结束；只归结出某个单文字不等于证完。
