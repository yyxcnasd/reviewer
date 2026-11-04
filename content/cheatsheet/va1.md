---
course: va1
title: 微积分 A1
---

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
