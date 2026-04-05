# paper-to-course

### 将任意学术论文转换为精美的交互式 HTML 课程——同时生成 PPTX 与 PDF

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-7C3AED?style=flat-square)](https://claude.ai/code)
[![English README](https://img.shields.io/badge/README-English-59A96A?style=flat-square)](README.md)

**paper-to-course** 是一个 [Claude Code](https://claude.ai/code) 技能，能将任意学术论文转换为一个精美的 HTML 交互课程，并同时生成 PPTX 演示文稿和 PDF 文件。

> **在线演示：** [`papers/deepseek-r1-zh/`](papers/deepseek-r1-zh/) — DeepSeek-R1（Nature 2025）中文课程，包含 HTML + PDF + PPTX，所有文件在一个文件夹内。

---

## ✨ 功能特色

- **7 种交互元素** — 公式拆解、发展时间线、方法对比表、消融图、组件对话动画、理解测验、术语提示
- **6 模块课程体系** — 问题与动机 → 发展脉络 → 主流方法对比 → 方法详解 → 实验与验证 → 局限与展望
- **单文件输出** — 完全自包含，零依赖，离线可用
- **PPT + PDF 同步生成** — 与 HTML 课程内容一致，所有输出在统一文件夹
- **温暖设计** — 米白 + 珊瑚红美学，别致字体
- **移动端友好** — 滚动导航，响应式布局

---

## 🚀 快速开始

### 方法一：`npx skills add`（推荐）

```bash
npx skills add KaguraTart/paper-to-course
```

直接从 GitHub 安装，适用于任意包含有效 `SKILL.md` 的 GitHub 仓库。

### 方法二：手动复制

```bash
git clone https://github.com/KaguraTart/paper-to-course.git
cp -r paper-to-course ~/.claude/skills/
```

### 方法三：Claude Code 插件市场

```bash
# 添加官方 Anthropic skills 市场
/plugin marketplace add anthropics/skills

# 添加社区市场
/plugin marketplace add jamesrochabrun/skills

# 安装
/plugin install paper-to-course
```

### 使用

在 Claude Code 中对任意项目说：

```
把这篇论文转成课程
```

指向 PDF 或 LaTeX 源码，技能自动完成全流程——HTML + PDF + PPTX 全部输出到 `papers/<name>/` 文件夹。

---

## 📂 文件结构

```
paper-to-course/
├── SKILL.md                    # Claude Code 技能说明
├── README.md                   # 英文说明
├── README_zh.md               # 中文说明（本文）
├── LICENSE                     # MIT 协议
├── papers/                    # 生成的文件输出
│   └── deepseek-r1-zh/       # 示例：所有输出在统一文件夹
│       ├── index.html         # 交互式 HTML 课程
│       ├── *.pdf              # PDF 导出（Chrome headless 生成）
│       ├── presentation.pptx  # 16 页 PPTX（含截图）
│       ├── screenshots/       # 每模块 PNG 截图
│       └── generate-pptx.js   # 可复用的 PPTX 生成器
├── scripts/
│   ├── build-all.js           # 统一流水线：HTML + PDF + PPTX + 截图
│   └── generate-pptx.js       # PPTX 生成器（独立运行）
└── references/
    ├── styles.css              # 完整设计系统
    ├── main.js                 # 交互引擎
    ├── build.sh               # HTML 打包脚本（传统）
    ├── _base.html             # HTML 模板
    ├── _footer.html           # HTML 尾部
    └── paper-elements.md      # 7 种元素实现模式
```

---

## 📦 统一构建流水线

一条命令生成所有输出（HTML + PDF + PPTX + 截图）：

```bash
# 构建中文版
node scripts/build-all.js deepseek-r1-zh --zh

# 构建英文版
node scripts/build-all.js deepseek-r1-test --en

# 构建双语
node scripts/build-all.js deepseek-r1-zh
```

输出到 `papers/<name>/`：
- `index.html` — 合并后的 HTML 课程
- `*.pdf` — PDF 导出（Chrome headless）
- `presentation.pptx` — 包含截图的 PPTX
- `screenshots/` — 每模块 PNG 截图

**前置依赖：**
```bash
npm install -g pptxgenjs puppeteer-core
# 需要 Chrome/Chromium 并在 PATH 中
```

---

## 🔌 接入其他 CLI 工具（codex、openclaw 等）

`npx skills add` 适用于任何 Claude Code 兼容技能。

### 安装其他 CLI 工具为 skill

```bash
# 安装 Codex（OpenAI 编程智能体）
npx skills add openai/codex

# 安装 skill-publisher（自动 GitHub 发布）
npx skills add joeseesun/skill-publisher

# 从任意 GitHub 仓库安装
npx skills add <owner>/<repo>
```

### openclaw 接入说明

[openclaw](https://openclaw.ai) 是一个本地 AI Agent，可与 Claude Code 协同工作。接入 paper-to-course：

```bash
# 安装 openclaw
curl -fsSL https://openclaw.ai/install.sh | bash
openclaw onboard

# 在 openclaw 中安装 paper-to-course
# 方法一：复制到 openclaw skills 目录
cp -r paper-to-course ~/.openclaw/skills/

# 方法二：通过 openclaw CLI（若版本支持）
openclaw skills add paper-to-course

# 方法三：通过 openclaw Web IDE
# Settings → Skills → Add Skill → 指向 SKILL.md 文件
```

**openclaw Webhook 集成：** 在 `~/.claude/settings.json` 中配置 openclaw Webhook：

```json
{
  "openclaw": {
    "webhookUrl": "http://<your-openclaw-instance>:8080/webhook"
  }
}
```

### Claude Code 插件市场

| 市场 | 命令 | 说明 |
|------|------|------|
| Anthropic 官方 | `/plugin marketplace add anthropics/skills` | `/plugin install <skill>` |
| 社区市场 | `/plugin marketplace add jamesrochabrun/skills` | 24+ 技能 |
| Focus.AI | `/plugin marketplace add the-focus-ai/claude-marketplace` | 主题 + 工作流 |

---

## 🌍 发布到 Claude Code Skills 平台

### 方式一：GitHub 发布（推荐）

Skills 生态基于 GitHub。发布步骤：

1. **创建公开 GitHub 仓库**，包含你的 skill
2. **添加有效的 `SKILL.md`**，含 YAML frontmatter：
   ```yaml
   ---
   name: paper-to-course
   description: Transform any paper into an interactive HTML course + PPTX + PDF
   ---
   ```
3. **在 `SKILL.md` 中编写清晰说明**（参考现有示例）
4. **添加 `README.md`** 说明安装方式
5. **注册到市场（可选）**：
   ```bash
   # 使用 skill-publisher 自动化发布
   npx skills add joeseesun/skill-publisher
   # 然后告诉 Claude："把我的 skill 发布到 GitHub"
   ```
6. **分享** — 用户通过 `npx skills add <owner>/<repo>` 安装

### 方式二：提交到插件市场

向市场仓库提交 PR：
- **Anthropic 官方 skills：** PR 到 `github.com/anthropics/skills`
- **社区市场：** PR 到各自仓库

### 方式三：openclaw Skills 平台

1. 发布到 GitHub
2. 提交到 [openclaw skills 注册中心](https://openclaw.ai/skills)
3. 或使用 openclaw onboard 向导 → Skills → Add from GitHub

---

## 🎓 适用场景

| 使用者 | 如何受益 |
|--------|---------|
| **ML/AI 研究者** | 快速摸底新论文的核心贡献，无需通读全文 |
| **博士生** | 通过结构化交互教程系统学习新子领域 |
| **研究团队** | 为新成员创建知识入门材料 |
| **教育工作者** | 将论文转化为带测验的互动课件 |
| **技术负责人** | 评估某论文方法是否适合生产需求 |

---

## 🆚 与通用论文摘要的区别

- **生成完整课程** — 结构化模块，而非零散要点
- **逐行解释公式** — 每个公式都有通俗翻译
- **可视化演进路径** — 时间线展示领域如何发展
- **深入方法对比** — 不仅列出方法，更展示权衡取舍
- **内置理解测验** — 验证读者是否真正理解
- **所有输出在统一文件夹** — HTML + PDF + PPTX，不分散

---

## 🔧 自定义

所有 CSS 和 JS 在 `references/` 中，可直接复制到课程目录修改：

```css
/* 覆盖主题色 */
:root { --color-accent: #7C3AED; }
```

详见 `references/paper-elements.md` 中的所有可用元素模式。

---

## 📋 环境要求

- [Claude Code](https://claude.ai/code) — 任意版本
- Node.js（用于 PPTX 生成）
- Chrome 或 Chromium（用于 PDF 生成）
- PDF 或 LaTeX 格式的论文

---

## 📜 协议

MIT — 可自由使用、修改和分发。引用请注明来源。
