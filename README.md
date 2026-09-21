# ∇ Reinforcement Learning Labs · 强化学习交互式论文精读

基于原论文的中文强化学习可视化学习站点。使用纯静态 HTML / CSS / 原生 JavaScript，结合数学推导、独立绘制的 SVG 曲线、可交互参数实验和参考代码，逐步学习策略梯度及近端策略优化。

## 在线课程

| 课程 | 在线地址 | 内容 |
| --- | --- | --- |
| 01 · REINFORCE | [打开 REINFORCE Lab](https://1998x-stack.github.io/reinforcement-learning-learning/) | Williams 1992 原论文、策略梯度、Reward-to-Go、Baseline、PyTorch 与 PPO 的联系 |
| 02 · PPO | [打开 PPO Lab](https://1998x-stack.github.io/reinforcement-learning-learning/ppo/) | Schulman et al. 2017 原论文、Actor–Critic / GAE、TRPO、概率比率、Figure 1 裁剪曲线交互重构、Algorithm 1、训练诊断及科研实验 |

> 上述在线地址只有在仓库 GitHub Pages 已启用且部署成功后才会正常访问；源代码已经保存在 `main` 分支。PPO 页面可直接在仓库的 [`ppo/index.html`](ppo/index.html) 查看。

## PPO Lab：章节与互动功能

1. **MDP 与策略梯度**：轨迹概率、对数导数技巧、状态价值与优势函数。
2. **Actor–Critic 与 GAE**：拖动 λ，实时观察五步 TD 误差权重与优势估计。
3. **TRPO 与重要性采样**：控制两个动作的新旧策略概率，查看概率比率及精确 KL 散度。
4. **PPO-Clip**：独立重绘原论文 Figure 1，联动调整 `r`、`ε` 与 `|Â|`，观察正负优势的裁剪平坦区。
5. **为什么使用 `min`**：两组数值实验解释为何只对有利方向上的过度代理收益进行裁剪。
6. **完整训练回路**：Rollout → GAE → K 轮 Minibatch 更新 → 重新采样；区分真实终止与外部截断。
7. **损失、PyTorch、超参数与研究**：策略/价值/熵目标、PPO-Penalty、单批次参考代码、KL/Clip Fraction、消融实验和原论文链接。

PPO Lab 源代码位于 `ppo/index.html`、`ppo/styles.css`、`ppo/script.js`。样式支持桌面和移动设备、浅色/深色主题、键盘导航及低动态效果偏好。所有曲线和示意为独立教学重绘，不是论文截图。网页公式经 MathJax CDN 渲染；离线时会保留 LaTeX 原文。站点无需构建步骤和后端。

## REINFORCE Lab

主页保留已有 REINFORCE 课程，包含 Williams 1992 原论文、Observe → Sample → Interact → Evaluate → Update 流程、二动作 Bernoulli 策略实验、对数梯度推导、Reward-to-Go、Baseline 无偏性证明、PyTorch 更新函数以及与 Actor–Critic / PPO 的联系。

## GitHub Pages 部署

仓库中的 [`.github/workflows/pages.yml`](.github/workflows/pages.yml) 在 `main` 分支有提交时自动尝试部署整个静态站点，课程直接以相对路径引用资源：根目录为 REINFORCE，`/ppo/` 为 PPO。

如果 Actions 中的部署在 **Configure Pages** 阶段出现 `Get Pages site failed` 或 `Not Found`：仓库管理员需进入 [Settings → Pages](https://github.com/1998x-stack/reinforcement-learning-learning/settings/pages)，将 **Build and deployment → Source** 设为 **GitHub Actions**，然后在 [Actions](https://github.com/1998x-stack/reinforcement-learning-learning/actions) 中重新运行 Pages 工作流。若工作流中的 `enablement: true` 有足够权限，首次启用步骤也可能自动完成；以 Actions 结果为准。

> 不要同时将 Pages 来源配置为 `Deploy from a branch` 和 `GitHub Actions`。部署成功后打开 https://1998x-stack.github.io/reinforcement-learning-learning/ppo/ 。

## 本地预览

在仓库根目录执行：

```bash
python -m http.server 8000
```

浏览器访问 http://localhost:8000/ppo/ 。无需 npm 或前端构建。部分浏览器的剪贴板 API 需要 localhost 或 HTTPS。

## 原论文与延伸阅读

- Williams, R. J. (1992). *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning*. https://doi.org/10.1007/BF00992696
- Schulman, J. et al. (2015). *Trust Region Policy Optimization*. https://arxiv.org/abs/1502.05477
- Schulman, J. et al. (2015). *High-Dimensional Continuous Control Using Generalized Advantage Estimation*. https://arxiv.org/abs/1506.02438
- Schulman, J. et al. (2017). *Proximal Policy Optimization Algorithms*. https://arxiv.org/abs/1707.06347
- OpenAI Spinning Up · PPO: https://spinningup.openai.com/en/latest/algorithms/ppo.html
- CleanRL · PPO: https://docs.cleanrl.dev/rl-algorithms/ppo/
- *Implementation Matters in Deep Policy Gradients*: https://arxiv.org/abs/2005.12729

**内容说明：** 本站为教育用途的现代化重构。特别区分 PPO 裁剪代理目标与严格的策略概率约束，也不声称 PPO 在任意环境中具有每次更新单调改善的保证。
