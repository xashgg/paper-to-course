# paper-to-course

### 将任意学术论文转换为精美的交互式单页 HTML 课程

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-7C3AED?style=flat-square)](https://claude.ai/code)
[![English README](https://img.shields.io/badge/README-English-59A96A?style=flat-square)](README.md)

**paper-to-course** 是一个 [Claude Code](https://claude.ai/code) 技能，能将任意学术论文转换成交互式单页 HTML 课程——无需服务器、无依赖、纯浏览器运行。

它解析论文结构，设计 6 个模块的课程大纲，并生成交互式元素：公式拆解、发展时间线、方法对比表、消融图、组件对话动画、理解测验、术语提示。

> **在线演示：** 查看效果 → [`deepseek-r1-test-zh/`](deepseek-r1-test-zh/) — DeepSeek-R1（Nature 2025）中文版课程
>
> **英文版：** [English README](README.md)

---

## ✨ 功能特色

- **7 种交互元素** — 每种都为论文教学专门设计

| 元素 | 功能说明 |
|------|---------|
| **Formula Breakdown** | 数学公式逐行翻译成通俗中文 |
| **Literature Timeline** | 领域发展时间线动画，展示关键节点 |
| **Comparison Table** | 悬停查看方法间的详细权衡分析 |
| **Ablation Diagram** | 可视化消融实验，展示各组件贡献度 |
| **Method Chat** | 动画展示组件间的"对话"协作逻辑 |
| **Comprehension Quiz** | 选择题测试论文理解程度 |
| **Glossary Tooltips** | 悬停技术术语，即时显示通俗解释 |

- **6 模块课程体系** — 每篇论文统一结构：
  1. 问题与动机
  2. 发展脉络
  3. 主流方法对比
  4. 方法详解
  5. 实验与验证
  6. 局限与展望

- **单文件输出** — 完全自包含，零依赖，离线可用
- **温暖设计** — 米白 + 珊瑚红美学，别致字体
- **移动端友好** — 滚动导航，响应式布局

---

## 🚀 快速开始

### 1. 安装（30 秒）

```bash
# 复制到 Claude Code skills 目录
cp -r paper-to-course ~/.claude/skills/
```

### 2. 使用

在 Claude Code 中说：

```
把这篇论文转成课程
```

指向 PDF 或 LaTeX 源码，剩下的交给你。

### 3. 打开

```bash
open index.html   # macOS
xdg-open index.html   # Linux
```

---

## 📂 文件结构

```
paper-to-course/
├── SKILL.md                  # Claude Code 技能说明
├── README.md                 # 英文版说明（默认）
├── README_zh.md              # 中文版说明（本文）
├── LICENSE                   # MIT 协议
├── deepseek-r1-test/        # 英文演示课程：DeepSeek-R1 (Nature 2025)
├── deepseek-r1-test-zh/     # 中文演示课程：DeepSeek-R1 (Nature 2025)
└── references/
    ├── styles.css            # 完整设计系统
    ├── main.js               # 交互引擎
    ├── build.sh              # HTML 打包脚本
    ├── _base.html            # HTML 模板
    ├── _footer.html          # HTML 尾部
    └── paper-elements.md     # 7 种元素实现模式
```

---

## 🎓 适用场景

| 使用者 | 如何受益 |
|--------|---------|
| **ML/AI 研究者** | 快速摸底新论文的核心贡献，无需通读全文 |
| **博士生** | 通过结构化交互教程系统学习新子领域 |
| **研究团队** | 为新成员创建知识入门材料 |
| **技术负责人** | 评估某论文方法是否适合生产需求 |
| **教育工作者** | 将论文转化为带测验的互动课件 |

---

## 🆚 与通用论文摘要的区别

paper-to-course 不是泛化的摘要工具：

- **生成完整课程** — 结构化模块，而非零散要点
- **逐行解释公式** — 每个公式都有通俗中文翻译
- **可视化演进路径** — 时间线展示领域如何发展
- **深入方法对比** — 不仅列出方法，更展示权衡取舍
- **内置理解测验** — 验证读者是否真正理解

---

## 🛠️ 工作原理

技能读取论文（PDF 或 LaTeX），然后：

1. **分析** — 提取结构：摘要 → 相关工作 → 方法 → 实验 → 结论
2. **设计** — 为本论文定制 6 模块课程大纲
3. **生成** — 使用参考设计系统编写 HTML 模块
4. **打包** — 运行 `build.sh` 生成单一 `index.html`

生成的课程可在任何浏览器中打开，邮件发送，或托管在任何静态服务器上。

---

## 📋 环境要求

- [Claude Code](https://claude.ai/code) — 任意版本
- PDF 或 LaTeX 格式的论文

---

## 📜 协议

MIT — 可自由使用、修改和分发。引用请注明来源。
