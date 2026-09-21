# Knowledge Atlas · 交互式学习知识库

按**知识类别 → 专题课程**组织的静态学习站点，新增贯穿各个类别的 **Questions（问题深究）** 环节：算法课负责系统学习，Questions 负责将容易混淆的概念沉淀为独立研究笔记与交互式可视化实验。

**网站首页：** https://1998x-stack.github.io/reinforcement-learning-learning/ · [Questions 入口](https://1998x-stack.github.io/reinforcement-learning-learning/questions/) · [强化学习入口](https://1998x-stack.github.io/reinforcement-learning-learning/reinforcement-learning/)

## 仓库目录

```text
.
├── index.html                            # 全站首页：类别 / 课程 / Questions
├── catalog.json                          # categories 与 questions 统一元数据
├── assets/
│   ├── site.css                          # 首页、类别页、问题列表公共视觉系统
│   └── site.js                           # 动态目录、问题卡片和搜索过滤
├── reinforcement-learning/
│   ├── index.html                        # 强化学习首页：课程 + 本类别 Questions
│   ├── reinforce/                        # REINFORCE 独立 HTML/CSS/JS 课程
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── app.js
│   │   └── favicon.svg
│   └── ppo/                              # PPO 独立 HTML/CSS/JS 课程
│       ├── index.html
│       ├── styles.css
│       └── script.js
├── questions/
│   ├── index.html                        # 可跨知识类别检索的 Questions 索引
│   └── ppo-on-policy/
│       ├── README.md                     # PPO On-Policy 问题的完整论证与文献
│       ├── index.html                    # 交互式文章 / 训练时间轴 / 概率图
│       ├── styles.css
│       └── app.js
├── ppo/index.html                        # 旧 PPO 链接兼容跳转
├── favicon.svg
├── .nojekyll
└── .github/workflows/pages.yml           # GitHub Pages 自动部署
```

## 已发布内容

| 类型 | 专题 | 重点 | 在线入口 |
| --- | --- | --- | --- |
| 强化学习课程 | REINFORCE | Williams 1992、策略梯度、Reward-to-Go、Baseline、概率实验、PyTorch | [REINFORCE](https://1998x-stack.github.io/reinforcement-learning-learning/reinforcement-learning/reinforce/) |
| 强化学习课程 | PPO | Schulman et al. 2017、Actor–Critic、GAE、TRPO、PPO-Clip 与诊断 | [PPO](https://1998x-stack.github.io/reinforcement-learning-learning/reinforcement-learning/ppo/) |
| Questions · 强化学习 | 为什么 PPO 是 On-Policy，却又“不太像”？ | 数据生命周期、行为/目标策略、动作比率、状态分布与 Clip 限制 | [交互式网页](https://1998x-stack.github.io/reinforcement-learning-learning/questions/ppo-on-policy/) · [完整研究笔记](questions/ppo-on-policy/README.md) |

### Questions 001：PPO 是 On-Policy 吗？

标准 PPO 每轮使用当前策略采样新 rollout，对同一批数据执行有限次数的 minibatch 更新，再丢弃该批次并重新采样。因此它在**训练范式**上通常归类为 On-Policy。不过，一旦开始更新，当前目标策略就不再与生成本批样本的行为策略完全相同；在**单次梯度更新**的严格口径下，它确实存在局部使用旧策略数据的特征。

该问题的 [Markdown 笔记](questions/ppo-on-policy/README.md) 保存完整的数学推导、论文链接、边界条件和自测问题；配套 [HTML 可视化](questions/ppo-on-policy/index.html) 提供三种实验：

1. **训练时间轴：** 观察 `π_old` 保持固定，而 `π_θ` 在同一批次内逐步变化。
2. **状态分布实验：** 调节新旧策略动作概率，比较单步动作重要性比率与后续状态访问概率。
3. **PPO-Clip 曲线：** 调整优势符号、比率 `r` 与裁剪范围 `ε`，区分代理目标的平坦区和真实策略的硬约束。

一个要点：单步动作重要性比率可以在给定状态下重加权动作概率，却**不能一般地将旧状态访问分布变成新状态访问分布**。PPO-Clip 限制特定方向上额外的代理收益，但不保证全部概率比率落入裁剪区间，也不保证策略回报单调提升。

## 如何增加新课程、新问题与新类别

**新增算法课程：** 在已有类别下创建 `<category-slug>/<course-slug>/index.html` 与独立静态资源，再为该类别在 `catalog.json → categories[].courses` 中新增课程记录。`href` 必须使用从站点根目录开始的相对路径，例如 `reinforcement-learning/ppo/`。

**新增 Questions：** 创建 `questions/<question-slug>/README.md` 记录完整解释、推导、来源和学习要点；创建同目录 `index.html`（及必要的 `styles.css`、`app.js`）制作交互页面。随后在 `catalog.json → questions` 中新增一条对象。至少填写唯一 `slug`、`title`、`subtitle`、`href`、`doc`、所属类别的 `categorySlug` 和 `topics`。首页、Questions 索引与对应类别首页会自动渲染新卡片；没有对应类别时可将 `categorySlug` 留空，在全站 Questions 列表仍可显示。

```json
{
  "slug": "example-question",
  "title": "一个值得深究的问题？",
  "subtitle": "这一问题的核心解释与实验简介。",
  "href": "questions/example-question/",
  "doc": "questions/example-question/README.md",
  "categorySlug": "reinforcement-learning",
  "categoryTitle": "强化学习",
  "eyebrow": "QUESTION 002 · CONCEPTS",
  "topics": ["概念", "可视化"]
}
```

**新增类别：** 新建 `<category-slug>/index.html`（可参考 `reinforcement-learning/index.html`，配置 `data-view="category"`、`data-category`、`data-root-prefix="../"` 和 `data-catalog-path="../catalog.json"`），登记到 `categories` 数组，并将其课程置于该类别目录中。Questions 不必随着类别分别复制：所有问题共享根目录的 `questions/`，用 `categorySlug` 关联对应类别。

仅登记**实际存在且可以打开的页面**。课程、问题资源优先使用相对 URL，以适配 GitHub Pages 的仓库子路径；可视化脚本独立维护，避免不同专题之间的 ID/CSS 互相影响。浏览器直接打开 `file://` 时，HTML 内置静态卡片仍提供已发布内容的导航；动态目录需本地 HTTP 服务。

## 兼容旧链接

原根目录 REINFORCE 课程迁移到 `/reinforcement-learning/reinforce/`，旧根目录课程章节 URL（例如 `/#experiment`）自动跳转至新位置。旧 `/ppo/` 路径跳转至 `/reinforcement-learning/ppo/` 并保留查询参数与锚点。新的 Questions 位于独立的 `/questions/` 路径，不修改旧课程交互脚本。

## 本地预览与部署

```bash
python -m http.server 8000
```

浏览器打开 http://localhost:8000/ ，并分别检查 `/reinforcement-learning/`、`/questions/` 与 `/questions/ppo-on-policy/`。每次推送 `main` 会触发 [Pages workflow](.github/workflows/pages.yml)，部署整个静态仓库；在仓库 [Actions](https://github.com/1998x-stack/reinforcement-learning-learning/actions) 中确认部署状态。

## 主要参考文献

- Williams, R. J. (1992). *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning*. https://doi.org/10.1007/BF00992696
- Schulman, J. et al. (2017). *Proximal Policy Optimization Algorithms*. https://arxiv.org/abs/1707.06347
- Schulman, J. et al. (2015). *Trust Region Policy Optimization*. https://arxiv.org/abs/1502.05477
- OpenAI Spinning Up · PPO: https://spinningup.openai.com/en/latest/algorithms/ppo.html
