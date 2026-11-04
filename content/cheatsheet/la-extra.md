---
course: la
title: 线性代数（期末补充）
terms: [final]
---

### 向量组的秩与极大无关组

\[
r(\alpha_1,\dots,\alpha_s)=\text{极大无关组中向量的个数}
\]

提示：把向量按列排成矩阵，行变换化阶梯形，非零行数即秩，主元列对应的原向量构成极大无关组。

### 矩阵的秩

\[
r(A)=r(A\T)=\text{最高阶非零子式的阶数}
\]

提示：行秩 = 列秩；乘可逆矩阵不改变秩；\(r(A)=r\) \(\iff\) \(A\) 相抵于 \(\diag(I_r,0)\)。

\[
r(A+B)\le r(A)+r(B),\qquad
r(AB)\le\min\{r(A),r(B)\},\qquad
r(AB)\ge r(A)+r(B)-n
\]

提示：最后一条对 \(n\) 阶方阵成立，常用来证明乘积秩的下界。

### 齐次方程组解的结构

\[
A\mathbf x=\mathbf 0:\quad \dim N(A)=n-r(A)
\]

提示：基础解系含 \(n-r(A)\) 个线性无关解，通解是它们的任意线性组合。

### 非齐次方程组解的结构

\[
A\mathbf x=\mathbf b\ \text{有解}\iff r(A)=r(A\mid b)
\]

提示：有解时通解 = 一个特解 + 对应齐次方程的通解；解集不是线性空间。

### 线性空间与过渡矩阵

\[
(\beta_1,\dots,\beta_n)=(\alpha_1,\dots,\alpha_n)P
\]

提示：\(P\) 是从基 \(\alpha\) 到基 \(\beta\) 的过渡矩阵，同一向量的坐标满足 \(x_\alpha=P x_\beta\)。

### 子空间

子空间对加法与数乘封闭；\(\dim W\le\dim V\)，等号成立当且仅当 \(W=V\)。
