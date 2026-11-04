---
course: la
title: 线性代数
---

### 行列式性质

\[|A\T|=|A|,\quad |AB|=|A||B|,\quad |kA|=k^{n}|A|,\quad |A^{-1}|=\frac{1}{|A|},\quad |A^{*}|=|A|^{n-1}\]
互换两行变号；某行乘 \(k\) 行列式乘 \(k\)；两行相同或成比例则为 0；一行乘 \(k\) 加到另一行不变（最常用）。

### 展开与余子式

\[|A|=\sum_{j=1}^{n}a_{ij}A_{ij},\qquad A_{ij}=(-1)^{i+j}M_{ij}\]

异乘和为零：\(\sum_j a_{ij}A_{kj}=0\ (i\ne k)\)。求「某行代数余子式的线性组合」时，把系数替换到那一行再算。
范德蒙德：\(\prod\limits_{1\le i<j\le n}(x_j-x_i)\)。

### 伴随与逆

\[AA^{*}=A^{*}A=|A|E,\qquad A^{-1}=\frac{1}{|A|}A^{*}\quad(|A|\ne0)\]

\(A\) 可逆 \(\iff|A|\ne0\iff A\) 与 \(E\) 相抵 \(\iff\) 齐次组只有零解。

### 初等变换

左乘初等矩阵 = 行变换，右乘 = 列变换。求逆：\([A\mid E]\to[E\mid A^{-1}]\)。

分块：\(\begin{pmatrix}A&0\\0&B\end{pmatrix}^{-1}=\begin{pmatrix}A^{-1}&0\\0&B^{-1}\end{pmatrix}\)，\(\begin{pmatrix}A&C\\0&B\end{pmatrix}^{-1}=\begin{pmatrix}A^{-1}&-A^{-1}CB^{-1}\\0&B^{-1}\end{pmatrix}\)。

### 克莱姆法则

\(A\mathbf x=\mathbf b\)、\(|A|\ne0\) 时 \(x_j=\dfrac{|A_j|}{|A|}\)，\(A_j\) 是把第 \(j\) 列换成 \(\mathbf b\)。

### 线性相关

存在不全为零的 \(k_i\) 使 \(\sum k_i\alpha_i=0\) 即相关。
判定：含零向量必相关；个数大于维数必相关；部分相关则整体相关；整体无关则部分无关。
无关且 \(\beta\) 可由它们表示 \(\iff\) 表示法唯一。

### 向量组与矩阵的秩（期末）

秩 = 极大无关组中向量个数 = 非零子式的最高阶数；行秩 = 列秩。
\[r(A+B)\le r(A)+r(B),\quad r(AB)\le\min\{r(A),r(B)\},\quad r(AB)\ge r(A)+r(B)-n\]
\(A\mathbf x=\mathbf 0\)：解空间维数 \(=n-r(A)\)；\(A\mathbf x=\mathbf b\)：\(r(A)\ne r(A|b)\) 无解，相等时通解 = 特解 + 齐次通解。
