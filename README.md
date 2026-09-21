# ∇ REINFORCE Lab · 交互式论文精读

基于 Ronald J. Williams (1992) 原论文的中文 REINFORCE 可视化学习站点。完整展示论文背景、策略更新流程、Log-Derivative Trick、Reward-to-Go、Baseline、PyTorch 实现和从 REINFORCE 到 PPO 的联系。

**网站地址（GitHub Pages 启用并完成部署后）：** https://1998x-stack.github.io/reinforcement-learning-learning/

## 学习内容

| 章节 | 内容 |
| --- | --- |
| 01 | Williams 1992 原论文：随机神经元与现代参数化策略 |
| 02 | Observe → Sample → Interact → Evaluate → Update 流程 |
| 03 | 二动作 Bernoulli 策略实验：改变初始概率、采样动作、奖励、基线和学习率 |
| 04 | 单步策略梯度与轨迹概率的对数梯度推导 |
| 05 | 交互式三步轨迹 Reward-to-Go，附严格折扣目标的权重说明 |
| 06 | Baseline 无偏性证明与可调参考线实验 |
| 07 | 无折扣 Monte Carlo REINFORCE 的 PyTorch 核心更新函数 |
| 08 | 与 Actor-Critic、PPO 的联系与限制 |
| 09 | 回到原论文 Theorem 1 的适用条件与核心思想 |

## 技术实现

纯静态 HTML / CSS / 原生 JavaScript，无构建依赖或后端。公式使用 [KaTeX](https://katex.org/) CDN；网络无法访问 CDN 时，会退化显示原始 LaTeX 文本。字体也优先通过 CDN 加载，同时提供系统字体回退。页面支持移动端章节菜单、键盘访问、动态阅读进度、代码复制与 `prefers-reduced-motion`。

## GitHub Pages 部署

仓库已包含 `.github/workflows/pages.yml`，在 `main` 分支 push 后自动触发静态站点部署。**如果这是此仓库第一次启用 Pages，请由仓库管理员在 GitHub 页面完成一次设置：**

1. 打开 [Settings → Pages](https://github.com/1998x-stack/reinforcement-learning-learning/settings/pages)。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
3. 在仓库的 [Actions](https://github.com/1998x-stack/reinforcement-learning-learning/actions) 中查看 `Deploy REINFORCE Lab to GitHub Pages` 的结果；必要时手动运行该 workflow。
4. 部署成功后访问 https://1998x-stack.github.io/reinforcement-learning-learning/ 。

另一种可选方案：在 Settings → Pages 中选择 **Deploy from a branch → main → /(root)**，直接从仓库根目录发布静态页面；这种情况下不需要使用自定义 Pages workflow。不要同时依赖两种方式的部署来源。

## 本地预览

在仓库根目录执行 `python -m http.server 8000`，然后打开 http://localhost:8000/ 。由于没有打包构建，也可直接打开 `index.html` 预览（某些浏览器的剪贴板功能需要 localhost 或 HTTPS）。

## 原论文与延伸阅读

- Williams, R. J. (1992). *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning*. Machine Learning, 8, 229–256. https://doi.org/10.1007/BF00992696
- Sutton & Barto. *Reinforcement Learning: An Introduction*, 2nd ed., Chapter 13. http://incompleteideas.net/book/the-book-2nd.html
- Schulman et al. (2017). *Proximal Policy Optimization Algorithms*. https://arxiv.org/abs/1707.06347

> 内容说明：此站点是面向学习的现代化重构，已经区分原论文的随机神经元形式与现代多步 episodic REINFORCE；不将 PPO 的裁剪机制误述为每次更新的单调性能保证。
