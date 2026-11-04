---
course: va1
title: 微积分 A1
---

### 等价无穷小（\(x\to0\)）

\[\sin x\sim x,\ \tan x\sim x,\ \arcsin x\sim x,\ \arctan x\sim x\]
\[\ln(1+x)\sim x,\ \e^{x}-1\sim x,\ (1+x)^{\alpha}-1\sim\alpha x,\ 1-\cos x\sim\frac{x^{2}}{2}\]
\[x-\sin x\sim\frac{x^{3}}{6},\ \tan x-x\sim\frac{x^{3}}{3},\ \tan x-\sin x\sim\frac{x^{3}}{2},\ \arcsin x-x\sim\frac{x^{3}}{6}\]
\[x-\ln(1+x)\sim\frac{x^{2}}{2},\ \ln(1+x)-x\sim-\frac{x^{2}}{2}\]

乘除可换，加减不行（会丢掉同阶主部）。

### 麦克劳林展开（\(x\to0\)）

\[\e^{x}=1+x+\frac{x^{2}}{2}+\frac{x^{3}}{6}+\frac{x^{4}}{24}+o(x^{4})\]
\[\sin x=x-\frac{x^{3}}{6}+o(x^{4}),\qquad \cos x=1-\frac{x^{2}}{2}+\frac{x^{4}}{24}+o(x^{4})\]
\[\ln(1+x)=x-\frac{x^{2}}{2}+\frac{x^{3}}{3}-\frac{x^{4}}{4}+o(x^{4})\]
\[(1+x)^{\alpha}=1+\alpha x+\frac{\alpha(\alpha-1)}{2}x^{2}+\frac{\alpha(\alpha-1)(\alpha-2)}{6}x^{3}+o(x^{3})\]
\[\tan x=x+\frac{x^{3}}{3}+o(x^{3}),\qquad \arctan x=x-\frac{x^{3}}{3}+o(x^{3})\]

### 求导公式

\[(x^{\alpha})'=\alpha x^{\alpha-1},\quad (a^{x})'=a^{x}\ln a,\quad (\ln x)'=\frac1x\]
\[(\sin x)'=\cos x,\ (\cos x)'=-\sin x,\ (\tan x)'=\sec^{2}x,\ (\cot x)'=-\csc^{2}x\]
\[(\arcsin x)'=\frac{1}{\sqrt{1-x^{2}}},\ (\arctan x)'=\frac{1}{1+x^{2}}\]
隐函数 \(F(x,y)=0\)：\(\dfrac{\d y}{\d x}=-\dfrac{F_x}{F_y}\)；参数方程：\(\dfrac{\d y}{\d x}=\dfrac{y'(t)}{x'(t)}\)，二阶导 \(\dfrac{\d}{\d t}\Big(\dfrac{y'}{x'}\Big)\Big/x'(t)\)（不是 \(\frac{y''}{x''}\)）。

### 高阶导数

\[(x^{n})^{(n)}=n!,\quad (\e^{ax})^{(n)}=a^{n}\e^{ax},\quad (\sin x)^{(n)}=\sin\Big(x+\frac{n\pi}{2}\Big)\]
\[(uv)^{(n)}=\sum_{k=0}^{n}\binom{n}{k}u^{(k)}v^{(n-k)}\]

### 中值定理

费马 \(f'(x_0)=0\)（内点极值 + 可导）；罗尔 \(f(a)=f(b)\Rightarrow\exists\xi,f'(\xi)=0\)；拉格朗日 \(f(b)-f(a)=f'(\xi)(b-a)\)；柯西 \(\dfrac{f(b)-f(a)}{g(b)-g(a)}=\dfrac{f'(\xi)}{g'(\xi)}\)（\(g'\ne0\)）。

辅助函数：见 \(f'+\lambda f\) 试 \(\e^{\lambda x}f\)。

### 洛必达

只对 \(\frac00\)、\(\frac{\infty}{\infty}\)；前提：去心邻域可导、\(g'\ne0\)、\(\lim\frac{f'}{g'}\) 存在或无穷。
反例 \(\lim\limits_{x\to\infty}\frac{x+\sin x}{x}=1\)，求导后无极限。\(0\cdot\infty\)、\(\infty-\infty\)、\(1^{\infty}\)、\(0^{0}\) 先化商或取对数。

### 泰勒公式

\[f(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^{k}+o\big((x-x_0)^{n}\big)\]
\[R_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}\]

算极限用皮亚诺，估误差、证不等式用拉格朗日。

### 连续与可导

可导 \(\Rightarrow\) 连续 \(\Rightarrow\) 有极限，反之不成立（\(|x|\) 在 0）。
间断点四类：可去、跳跃、无穷、振荡。闭区间连续：有界、最值、零点、介值、一致连续。

### 定积分与变上限积分

\[\Phi(x)=\int_a^x f(t)\d t\ \Longrightarrow\ \Phi'(x)=f(x)\]
\[\int_a^b f=0\Rightarrow f\text{ 变号（连续时）};\quad \Big|\int_a^b f\Big|\le\int_a^b|f|\]
积分中值：\(f\) 连续 \(\Rightarrow\exists\xi\in[a,b],\ \int_a^b f=f(\xi)(b-a)\)。

### 广义积分收敛判定

\(\int_1^{\infty}\frac{\d x}{x^{p}}\) 收敛 \(\iff p>1\)；\(\int_0^{1}\frac{\d x}{x^{p}}\) 收敛 \(\iff p<1\)。
比较判别：\(0\le f\le g\) 时 \(g\) 收敛 \(\Rightarrow f\) 收敛；\(f\) 发散 \(\Rightarrow g\) 发散。

### 常微分方程

一阶线性 \(y'+P(x)y=Q(x)\)：\(y=\e^{-\int P}\Big(\int Q\e^{\int P}\d x+C\Big)\)。
二阶常系数齐次：特征根 \(r_1\ne r_2\) 实 \(\Rightarrow C_1\e^{r_1x}+C_2\e^{r_2x}\)；\(r_1=r_2\) \(\Rightarrow(C_1+C_2x)\e^{rx}\)；共轭复根 \(\alpha\pm\beta\i\) \(\Rightarrow\e^{\alpha x}(C_1\cos\beta x+C_2\sin\beta x)\)。
