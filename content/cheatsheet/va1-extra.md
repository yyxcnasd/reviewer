---
course: va1
title: 微积分 A1（期末补充）
terms: [final]
---

### 极值与最值

\[
f'(x_0)=0\ \text{且}\ f''(x_0)<0\ \Rightarrow\ \text{极大};\qquad
f''(x_0)>0\ \Rightarrow\ \text{极小}
\]

提示：\(f''(x_0)=0\) 时失效，改用一阶条件看 \(f'\) 两侧符号；闭区间最值比较端点、驻点、不可导点。

### 凹凸与拐点

\[
f''(x)>0\Rightarrow\text{下凸（}\cup\text{ 形）};\qquad
f''(x)<0\Rightarrow\text{上凸（}\cap\text{ 形）}
\]

提示：拐点要 \(f''\) 两侧变号，\(f''=0\) 只是必要条件（\(x^{4}\) 在 \(0\) 不是拐点）。

### 三类渐近线

\[
k=\lim_{x\to\pm\infty}\frac{f(x)}{x},\qquad
b=\lim_{x\to\pm\infty}\left(f(x)-kx\right)
\]

提示：\(k\ne0\) 且 \(b\) 有限时得 \(y=kx+b\)；水平看 \(\lim f=b\)，垂直看 \(\lim_{x\to a}f=\infty\)。

### 作图步骤

定义域与奇偶性 \(\to\) \(f'\)、\(f''\) 的零点与不可导点 \(\to\) 列表定单调、凹凸 \(\to\) 渐近线 \(\to\) 极值点、拐点、交点 \(\to\) 连线。

提示：\(f'\)、\(f''\) 的零点放进同一张表，曲线与表格结论要一致。

### 定积分的定义与可积条件

\[
\int_a^b f\,\d x=\lim_{\lambda\to0}\sum_{i=1}^{n}f(\xi_i)\Delta x_i
\]

提示：可积必有界；连续、有界且只有有限个间断点、单调函数都可积，Darboux 判据是 \(S-s<\eps\)。

### 定积分的性质与中值定理

\[
\Big|\int_a^b f\,\d x\Big|\le\int_a^b\abs{f}\,\d x,\qquad
\int_a^b f\,\d x=f(\xi)(b-a)
\]

提示：保序、区间可加；中值定理要求 \(f\) 连续（带权时 \(g\) 不变号）。

### 变上限积分与 N-L 公式

\[
\frac{\d}{\d x}\int_{u(x)}^{v(x)}f(t)\,\d t=f(v)v'-f(u)u',\qquad
\int_a^b f\,\d x=F(b)-F(a)
\]

提示：N-L 要求 \(f\) 连续、\(F\) 是原函数；原函数跨瑕点就不能直接代。

### 换元与分部

\[
\int_a^b f(x)\,\d x=\int_\alpha^\beta f(\varphi(t))\varphi'(t)\,\d t,\qquad
\int_a^b u\,\d v=uv\Big|_a^b-\int_a^b v\,\d u
\]

提示：换元要同时换上下限；分部选 \(u\) 按“反三角、对数、幂、指数、三角”排。

### 定积分常用放缩

\[
m(b-a)\le\int_a^b f\,\d x\le M(b-a),\qquad
\int_0^1\frac{x^{n}}{1+x}\,\d x\le\frac{1}{n+1}
\]

提示：先放缩被积函数再积分；按符号或单调性拆区间。

### 广义积分的类型与算法

「无穷限」与「瑕积分」都是对端点取极限；先找瑕点，内部瑕点要拆成两段。

提示：计算时先求原函数，再对端点取极限。

### p 积分基准与比较判别

\[
\int_1^{+\infty}\frac{\d x}{x^{p}}\ \text{收敛}\iff p>1;\qquad
\int_0^{1}\frac{\d x}{x^{p}}\ \text{收敛}\iff p<1
\]

提示：正函数用比较或极限比较，变号函数用 Dirichlet 或 Abel。

### 绝对收敛与 Γ 函数

\[
\Gamma(s)=\int_0^{+\infty}x^{s-1}\e^{-x}\,\d x,\qquad
\Gamma(s+1)=s\Gamma(s),\qquad
\Gamma(n+1)=n!
\]

提示：绝对收敛 \(\Rightarrow\) 收敛，反之不成立；\(\Gamma\left(\frac12\right)=\sqrt{\pi}\)。

### 一阶方程的解法

\[
y'+P(x)y=Q(x):\quad
y=\e^{-\int P\,\d x}\left[\int Q\e^{\int P\,\d x}\,\d x+C\right]
\]

提示：可分离先分离再积分（注意丢常数解）；伯努利令 \(z=y^{1-n}\) 化为线性。

### 二阶常系数齐次

\[
r^{2}+pr+q=0
\]

提示：两相异实根 \(C_1\e^{r_1x}+C_2\e^{r_2x}\)；二重根 \((C_1+C_2x)\e^{rx}\)；共轭复根 \(\e^{\alpha x}(C_1\cos\beta x+C_2\sin\beta x)\)。

### 二阶非齐次特解

\[
f(x)=P_m(x)\e^{\lambda x}\ \Rightarrow\ y^{*}=x^{k}Q_m(x)\e^{\lambda x}
\]

提示：\(k\) 是 \(\lambda\) 作为特征根的重数；右端为 \(\e^{\alpha x}(A\cos\beta x+B\sin\beta x)\) 时看 \(\alpha+\beta\i\) 的重数。

### 初值问题解的存在唯一性

条件：\(f(x,y)\) 连续且关于 \(y\) 满足 Lipschitz 条件；结论：初值问题局部有唯一解。

提示：一阶线性方程 \(P,Q\) 连续时，解在整个区间上存在且唯一。
