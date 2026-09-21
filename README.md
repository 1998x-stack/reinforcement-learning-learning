# Knowledge Atlas · 交互式学习知识库

这是一个按**知识类别 → 专题课程**组织的静态学习网站。每篇课程以原论文、数学推导、可视化实验与参考代码为主要呈现方式。当前已发布 **强化学习** 类别的 **REINFORCE** 和 **PPO**；今后可以继续新增强化学习算法、基础理论、论文精读、工程实践，或建立完全不同的知识类别。

**网站首页：** https://1998x-stack.github.io/reinforcement-learning-learning/ （需 GitHub Pages 部署成功）

## 目录说明

```text
.
├── index.html                         # 通用知识库首页（不再是一篇 REINFORCE 课程）
├── catalog.json                       # 类别与已发布课程的统一目录数据
├── assets/
│   ├── site.css                       # 知识库首页/类别页共用视觉系统
│   └── site.js                        # 自动生成目录卡片和搜索过滤
├── reinforcement-learning/
│   ├── index.html                     # 强化学习类别首页
│   ├── reinforce/                     # REINFORCE 独立课程：HTML/CSS/JS/favicon
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── app.js
│   │   └── favicon.svg
│   └── ppo/                           # PPO 独立课程：HTML/CSS/JS
│       ├── index.html
│       ├── styles.css
│       └── script.js
├── ppo/index.html                     # 原 PPO 地址的兼容跳转（保留 URL 的 hash）
├── favicon.svg
├── .nojekyll
└── .github/workflows/pages.yml        # GitHub Pages 自动部署
```

## 已发布课程

| 类别 | 专题 | 内容 | 在线入口 |
| --- | --- | --- | --- |
| 强化学习 | REINFORCE | Williams 1992、策略梯度、Reward-to-Go、Baseline、交互式概率实验、PyTorch | [打开课程](https://1998x-stack.github.io/reinforcement-learning-learning/reinforcement-learning/reinforce/) |
| 强化学习 | PPO | Schulman et al. 2017、Actor–Critic、GAE、TRPO、PPO-Clip 曲线、训练诊断 | [打开课程](https://1998x-stack.github.io/reinforcement-learning-learning/reinforcement-learning/ppo/) |

[强化学习类别首页](https://1998x-stack.github.io/reinforcement-learning-learning/reinforcement-learning/) · [GitHub Pages 设置](https://github.com/1998x-stack/reinforcement-learning-learning/settings/pages)

## 如何增加新的类别与课程

**新增算法（已有类别）：** 在 `reinforcement-learning/<algorithm-slug>/` 放入独立的 `index.html`、`styles.css` 与 `script.js`（或其他静态资源）；在 `catalog.json` 中强化学习的 `courses` 数组新增一条课程记录，填写唯一 `slug`、名称、简介、站点根目录相对路径 `href`、关键词 `topics`。首页和类别页会从统一目录自动显示新卡片；若直接从 `file://` 打开 HTML，页面仍保留目前两门已发布课程的静态导航，建议以本地 HTTP 服务预览新增内容。

**新增其他知识类别：** 新建 `<category-slug>/index.html`（可参照 `reinforcement-learning/index.html`，设置 `data-category` 为新类别的 `slug`、`data-root-prefix="../"` 和 `data-catalog-path="../catalog.json"`），并在 `catalog.json` 的 `categories` 数组中新增类别记录与实际已发布课程；课程独立存放在 `<category-slug>/<course-slug>/`。避免使用中文、空格等作为路径名；每个类别和课程都有固定的短横线英文 slug。

`catalog.json` 数据示例：

```json
{
  "slug": "example-category",
  "title": "类别名称",
  "en": "CATEGORY NAME",
  "description": "类别简介",
  "href": "example-category/",
  "courses": [
    {
      "slug": "example-course",
      "title": "课程名称",
      "subtitle": "课程简介",
      "href": "example-category/example-course/",
      "eyebrow": "01 · ORIGINAL PAPER",
      "topics": ["关键词一", "关键词二"]
    }
  ]
}
```

仅登记**已经存在的页面**，避免出现无法访问的课程卡片。每个课程使用相对资源路径，以适配 GitHub Pages 的仓库子路径；外部论文给出来源，不复制全文或原文图表。独立课程可采用自己的视觉主题，但全站通用入口使用 `assets/site.css`。

## 兼容旧链接

原根目录的 REINFORCE 课程已迁移到 `/reinforcement-learning/reinforce/`。旧根目录课程章节 URL（例如 `/#experiment`）会跳转到新课程中对应的章节；旧 `/ppo/` 路径会跳转到 `/reinforcement-learning/ppo/`，并保留查询参数与锚点。原课程 HTML/CSS/JS 均通过原始 Git blob 迁移，不重新编写核心实验逻辑。

## 预览与部署

```bash
python -m http.server 8000
```

打开 http://localhost:8000/ 浏览全站入口；在本地 HTTP 服务中可加载 `catalog.json`。每次推送 `main` 会触发 [Pages workflow](.github/workflows/pages.yml)，部署整个静态仓库。首次部署前，请在仓库 Settings → Pages 中选择 **GitHub Actions** 作为 Source；之后在 Actions 页面检查实际部署状态。

## 主要论文

- Williams, R. J. (1992). *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning*. https://doi.org/10.1007/BF00992696
- Schulman, J. et al. (2017). *Proximal Policy Optimization Algorithms*. https://arxiv.org/abs/1707.06347
