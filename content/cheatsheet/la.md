---
course: la
title: 线性代数
---

### 行列式性质

1. \(|A^{T}|=|A|\)；互换两行变号；某行乘 \(k\)，行列式乘 \(k\)。
2. 两行相同或成比例 \(\Rightarrow 0\)；某行是两组数之和可拆开。
3. 一行乘 \(k\) 加到另一行，行列式不变（最常用的化简手段）。
4. \(|AB|=|A||B|\)，\(|kA|=k^{n}|A|\)，\(|A^{-1}|=1/|A|\)，\(|A^{*}|=|A|^{n-1}\)。

### 展开与余子式

\[|A|=\sum_{j=1}^{n}a_{ij}A_{ij}\quad(\text{按第 }i\text{ 行展开}),\qquad A_{ij}=(-1)^{i+j}M_{ij}\]

异乘和为零：\(\sum_j a_{ij}A_{kj}=0\ (i\ne k)\)。求「某行代数余子式的线性组合」时，把系数替换到那一行再算。

范德蒙德：\(\prod\limits_{1\le i<j\le n}(x_j-x_i)\)。

### 伴随与逆

\[AA^{*}=A^{*}A=|A|E,\qquad A^{-1}=\frac{1}{|A|}A^{*}\ (|A|\ne0)\]

\(A\) 可逆 \(\iff |A|\ne0\iff A\) 满秩 \(\iff A\) 与 \(E\) 相抵 \(\iff\) 齐次方程组只有零解。

### 初等变换

左乘初等矩阵 = 行变换，右乘 = 列变换。三种初等变换对应三种初等矩阵（互换、倍乘、倍加）。

求逆：\([A\mid E]\xrightarrow{\text{行变换}}[E\mid A^{-1}]\)。

分块：\(\begin{pmatrix}A&0\\0&B\end{pmatrix}^{-1}=\begin{pmatrix}A^{-1}&0\\0&B^{-1}\end{pmatrix}\)，
\(\begin{pmatrix}A&C\\0&B\end{pmatrix}^{-1}=\begin{pmatrix}A^{-1}&-A^{-1}CB^{-1}\\0&B^{-1}\end{pmatrix}\)。

### 克莱姆法则

\(A\mathbf x=\mathbf b\)，\(|A|\ne0\) 时 \(x_j=\dfrac{|A_j|}{|A|}\)，\(A_j\) 是把第 \(j\) 列换成 \(\mathbf b\)。

### 线性相关

\(\alpha_1,\dots,\alpha_s\) 线性相关，就是存在不全为零的 \(k_1,\dots,k_s\) 使 \(k_1\alpha_1+\cdots+k_s\alpha_s=0\)。

判定清单：含零向量必相关；向量个数大于维数必相关；部分相关则整体相关；整体无关则部分无关。

\(\alpha_1,\dots,\alpha_s\) 无关，\(\beta\) 可由它们表示 \(\iff\) 表示法唯一。

判断某个向量能否被其余向量表示、或者求表示系数，都是解线性方程组。
