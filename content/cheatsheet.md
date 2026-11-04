## 微积分 A1（到 4.3 节）

### 等价无穷小（\(x\to 0\)）

最常用的一排，记住就能拆掉一半填空题：

\[\sin x\sim x,\quad \tan x\sim x,\quad \arcsin x\sim x,\quad \arctan x\sim x\]

\[\ln(1+x)\sim x,\quad \e^{x}-1\sim x,\quad (1+x)^{\alpha}-1\sim \alpha x,\quad 1-\cos x\sim \frac{x^{2}}{2}\]

高一阶的几个（分母是 \(x^{3}\) 时才用得上）：

\[x-\sin x\sim\frac{x^{3}}{6},\qquad \tan x-x\sim\frac{x^{3}}{3},\qquad \tan x-\sin x\sim\frac{x^{3}}{2},\qquad \arcsin x-x\sim\frac{x^{3}}{6}\]

\[x-\ln(1+x)\sim\frac{x^{2}}{2},\qquad \ln(1+x)-x\sim-\frac{x^{2}}{2}\]

只在**乘除**里替换。加减项里替换会丢掉同阶主部——这是最常丢分的一处。

### 麦克劳林展开（\(x\to 0\)，到 \(x^{4}\)）

\[\e^{x}=1+x+\frac{x^{2}}{2}+\frac{x^{3}}{6}+\frac{x^{4}}{24}+o(x^{4})\]

\[\sin x=x-\frac{x^{3}}{6}+o(x^{4}),\qquad \cos x=1-\frac{x^{2}}{2}+\frac{x^{4}}{24}+o(x^{4})\]

\[\ln(1+x)=x-\frac{x^{2}}{2}+\frac{x^{3}}{3}-\frac{x^{4}}{4}+o(x^{4})\]

\[(1+x)^{\alpha}=1+\alpha x+\frac{\alpha(\alpha-1)}{2}x^{2}+\frac{\alpha(\alpha-1)(\alpha-2)}{6}x^{3}+o(x^{3})\]

\[\tan x=x+\frac{x^{3}}{3}+o(x^{3}),\qquad \arctan x=x-\frac{x^{3}}{3}+o(x^{3})\]

### 求导公式

\[(x^{\alpha})'=\alpha x^{\alpha-1},\quad (a^{x})'=a^{x}\ln a,\quad (\log_a x)'=\frac{1}{x\ln a},\quad (\ln x)'=\frac{1}{x}\]

\[(\sin x)'=\cos x,\ (\cos x)'=-\sin x,\ (\tan x)'=\sec^{2}x,\ (\cot x)'=-\csc^{2}x\]

\[(\sec x)'=\sec x\tan x,\ (\csc x)'=-\csc x\cot x\]

\[(\arcsin x)'=\frac{1}{\sqrt{1-x^{2}}},\quad (\arccos x)'=-\frac{1}{\sqrt{1-x^{2}}},\quad (\arctan x)'=\frac{1}{1+x^{2}}\]

隐函数 \(F(x,y)=0\)：\(\dfrac{\d y}{\d x}=-\dfrac{F_x}{F_y}\)。

参数方程：\(\dfrac{\d y}{\d x}=\dfrac{y'(t)}{x'(t)}\)；二阶导是 \(\dfrac{\d}{\d t}\Big(\dfrac{y'}{x'}\Big)\Big/x'(t)\)，**不是** \(\dfrac{y''}{x''}\)。

### 高阶导数

\[(x^{n})^{(n)}=n!,\qquad (\e^{ax})^{(n)}=a^{n}\e^{ax},\qquad (\sin x)^{(n)}=\sin\Big(x+\frac{n\pi}{2}\Big)\]

莱布尼茨：\((uv)^{(n)}=\sum\limits_{k=0}^{n}\binom{n}{k}u^{(k)}v^{(n-k)}\)。

### 中值定理

- **费马引理**：\(x_0\) 是内点极值点且可导 \(\Rightarrow f'(x_0)=0\)。
- **罗尔**：\([a,b]\) 连续、\((a,b)\) 可导、\(f(a)=f(b)\) \(\Rightarrow \exists\xi,\ f'(\xi)=0\)。
- **拉格朗日**：\(f(b)-f(a)=f'(\xi)(b-a)\)。
- **柯西**：\(\dfrac{f(b)-f(a)}{g(b)-g(a)}=\dfrac{f'(\xi)}{g'(\xi)}\)，要求 \(g'\ne 0\)。

三个条件缺一不可。造辅助函数：见 \(f'+\lambda f\) 试 \(\e^{\lambda x}f\)；见两个函数之差，作差用罗尔。

### 洛必达

只对 \(\dfrac00\) 与 \(\dfrac{\infty}{\infty}\) 直接可用。前提：分子分母在去心邻域可导、\(g'\ne0\)、\(\lim\dfrac{f'}{g'}\) 存在或为 \(\infty\)。

失效例子：\(\lim\limits_{x\to\infty}\dfrac{x+\sin x}{x}\)，求导后 \(1+\cos x\) 没有极限，而原极限是 \(1\)（分子分母同除 \(x\)）。未定式 \(0\cdot\infty\)、\(\infty-\infty\)、\(1^{\infty}\)、\(0^{0}\)、\(\infty^{0}\) 都要先化成商或取对数。

### 泰勒公式

皮亚诺（\(f\) 在 \(x_0\) 处 \(n\) 阶可导）：

\[f(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^{k}+o\big((x-x_0)^{n}\big)\]

拉格朗日余项（\(f\) 有 \(n+1\) 阶导数）：\(R_n(x)=\dfrac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}\)，\(\xi\) 在 \(x_0\) 与 \(x\) 之间。

算极限用皮亚诺，证不等式、估误差用拉格朗日。

### 连续与可导

可导 \(\Rightarrow\) 连续 \(\Rightarrow\) 有极限；反之不成立（\(|x|\) 在 \(0\) 处连续不可导）。

间断点：可去（左右极限相等但不等于或未定义）、跳跃（左右极限不等且有限）、无穷、振荡。

闭区间连续：有界性、最值、零点、介值（含一致连续：连续于闭区间 \(\Rightarrow\) 一致连续）。

## 线性代数（到向量组的秩之前）

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
