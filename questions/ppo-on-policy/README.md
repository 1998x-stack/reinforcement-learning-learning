# 为什么 PPO 是 On-Policy，却能反复使用旧策略的数据？

> Knowledge Atlas · Questions / 强化学习 · 关键词：PPO、On-Policy、Off-Policy、重要性采样、状态访问分布、PPO-Clip。对应的[交互式网页](./index.html)与[问题索引](../index.html)。

## 简要结论

**标准 PPO 是按训练迭代划分的 On-Policy 算法，但并不是“每次梯度更新都恰好在当前策略分布上采样”的严格 On-Policy 方法。** 每轮使用当前策略（随后冻结为 `π_old`）新采集一批轨迹，在这批数据上做有限轮 minibatch 优化，再舍弃这批数据并用更新后的策略采样。后续 minibatch 更新时，`π_θ` 已不同于生成数据的 `π_old`；这是一次迭代内的局部策略偏移，而不是无限期复用跨迭代历史经验。

`On-Policy`/`Off-Policy` 描述的是整体数据采集与学习范式，而不是简单地看目标中是否出现 `π_old`、是否用重要性采样或是否训练多个 epoch。更严格的单步口径下，PPO 在第一次更新后确实使用了与当前参数不完全一致的数据，因此可以说它**具有局部的 off-policy 特征**。这不改变标准 PPO 通常归类为 on-policy 的事实。

## 1. 在时间轴上区分行为策略和目标策略

1. 在迭代 `k` 开始，当前策略 `π_{θ_k}` 与环境交互，生成数据 `D_k`；保存采样动作、奖励、旧动作对数概率和价值估计等。
2. 固定 `π_old = π_{θ_k}` 的旧概率，更新当前待优化策略 `π_θ`，在同一批 `D_k` 上进行有限的 `K` 个 epoch/minibatch 更新。
3. 随着更新次数增加，`π_θ` 与 `π_old` 不再一致；PPO 通过概率比率与裁剪代理目标处理这段**局部偏移**。
4. 本轮结束后，标准 PPO 丢弃 `D_k`，用新的 `π_{θ_{k+1}}` 采集 `D_{k+1}`，再开始下一轮。

> 注意：重复使用刚采集的一批数据，不等于保留所有历史策略的 Replay Buffer。反过来，是否使用 Replay Buffer 也不是 Off-Policy 的定义；它只是 DQN/SAC 等实现中常见的经验复用机制。

## 2. PPO 的比率究竟校正了什么？

原论文 PPO-Clip 目标（样本平均形式）为：

\[
L^{\mathrm{CLIP}}(\theta)=\widehat{\mathbb E}_t\left[\min\big(r_t(\theta)\hat A_t,\;\mathrm{clip}(r_t(\theta),1-\epsilon,1+\epsilon)\hat A_t\big)\right],\quad
r_t(\theta)=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\mathrm{old}}(a_t\mid s_t)}.
\]

固定状态 `s`，且旧策略对新策略所用动作具有支持（`π_old(a|s)>0`）时，重要性采样恒等式为：

\[
\mathbb E_{a\sim\pi_{\mathrm{old}}(\cdot\mid s)}\left[\frac{\pi_\theta(a\mid s)}{\pi_{\mathrm{old}}(a\mid s)} f(s,a)\right]
=\mathbb E_{a\sim\pi_\theta(\cdot\mid s)}[f(s,a)].
\]

它能在**给定状态**下重加权动作概率，却不能凭一个单步动作比率把旧策略的状态访问分布也替换掉：

\[
\underbrace{d^{\pi_{\mathrm{old}}}(s)\pi_{\mathrm{old}}(a\mid s)}_{\text{行为数据分布}}\times
\underbrace{\frac{\pi_\theta(a\mid s)}{\pi_{\mathrm{old}}(a\mid s)}}_{\text{单步动作比率}}
=d^{\pi_{\mathrm{old}}}(s)\pi_\theta(a\mid s)
\ne d^{\pi_\theta}(s)\pi_\theta(a\mid s)\quad\text{（一般情形）}.
\]

因此，PPO 的单步比率本身并不是任意旧轨迹上真实新策略回报梯度的完整无偏校正。策略差距过大时，旧样本缺少新策略常访问的状态，也可能使优化失准。**比率大于 1 并不等于样本“更 on-policy”或“更好”**：它只是被采样动作在新旧策略下概率之比。

## 3. 为什么说这是围绕旧策略的“局部代理目标”？

忽略裁剪，把单批次目标理想化为：

\[
L_k(\theta)=\mathbb E_{s\sim d^{\pi_k},\,a\sim\pi_k}\left[\frac{\pi_\theta(a\mid s)}{\pi_k(a\mid s)} A^{\pi_k}(s,a)\right].
\]

这里状态权重 `d^{π_k}` 和优势 `A^{π_k}` 都来自采样策略。对于精确优势与一致的折扣状态访问权重，在 `θ=θ_k` 时，它的梯度与相应策略梯度一致（若 `d` 采用归一化约定，可能只差固定比例）。**离开这一参考点后，它一般只是局部代理，不等于新策略的真实回报**。

PPO-Clip 降低了在某些方向上扩大概率比率所带来的额外代理收益；它不是对所有动作概率比率的硬约束，也不能单凭裁剪保证新旧策略 KL 很小或每次更新回报单调提升。更改训练 epoch、学习率、`clip_range` 和 `target_kl` 会改变这一局部近似的有效程度；`target_kl` 在常见实现里通常是额外的监控/提前停止机制，而非原始裁剪表达式里的硬约束。

## 4. 与 REINFORCE、DQN、SAC 比较

| 方法 | 数据采集与训练 | 对旧经验的典型处理 |
| --- | --- | --- |
| REINFORCE（基本回合版） | 当前策略采集完整轨迹，以 Monte Carlo 回报更新 | 常在本次轨迹上更新后重新采样 |
| PPO（标准版） | 当前策略采集新 rollout，再对同一批数据执行有限的多轮优化 | 每轮结束丢弃本轮数据；随后重新采样 |
| DQN / SAC（常见实现） | 可以从不同历史行为策略采集数据，学习当前价值函数/策略 | Replay Buffer 反复采样跨轮历史转移 |

REINFORCE 与 PPO 的关系不是“前者纯 On-Policy、后者变成 Off-Policy”，而是 PPO 明确地容许**一个采样批次内**的有限重复优化。任意扩展标准 PPO 到长期历史经验池，需另行分析状态分布偏移、优势估计与目标函数的适用条件，不能仅靠原始 PPO-Clip 保证可靠性。

## 5. 自测问题

1. 第一次 minibatch 更新后，行为策略和目标策略仍完全相同吗？**不一定**：行为数据来自冻结的 `π_old`，更新后的 `π_θ` 已可能改变。
2. `r_t(θ)` 能把 `d^{π_old}` 直接变成 `d^{π_θ}` 吗？**不能**；它仅针对给定状态下的动作概率重加权。
3. `clip_range=0.2` 是否保证所有真实概率比率位于 `[0.8, 1.2]`？**不能**；裁剪的是代理目标的一个分支，不是硬约束。
4. 为什么 PPO 要重新采样？**保持每轮代理目标所依赖的状态分布与优势信息与最新行为策略相近**，避免无限期使用陈旧数据。

## 原论文与参考阅读

- Schulman et al. (2017), *Proximal Policy Optimization Algorithms*, Algorithm 1、Section 3：[arXiv:1707.06347](https://arxiv.org/abs/1707.06347)；[论文 PDF](https://arxiv.org/pdf/1707.06347)。
- OpenAI Spinning Up, [PPO](https://spinningup.openai.com/en/latest/algorithms/ppo.html)，将 PPO 作为 on-policy 方法介绍，并说明有限多轮优化与重新采样。
- Schulman et al. (2015), [Trust Region Policy Optimization](https://arxiv.org/abs/1502.05477)：局部策略代理与状态分布的相关背景。
- Haarnoja et al. (2018), [Soft Actor-Critic](https://arxiv.org/abs/1801.01290)；Mnih et al. (2013/2015), [DQN](https://arxiv.org/abs/1312.5602)：与典型 off-policy 经验复用作对照。

**阅读提示：** 本文中的“on-policy”是标准 PPO 的算法范式标签；单步梯度是否来自与当前参数完全相同的行为分布是另一层更严格的问题。两种口径不能混为一谈。
