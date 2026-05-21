# paper-to-course

### 将任意学术论文转换为交互式 HTML 课程 + Markdown 笔记 + PPTX 幻灯片

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-D94F30?style=flat-square)](https://openai.com/codex)
[![English README](https://img.shields.io/badge/README-English-blue?style=flat-square)](README.md)

**paper-to-course** 是一个面向 Codex 的技能包，可以把研究论文转换为：

**项目来源：** 本仓库 fork 并调整自 [KaguraTart/paper-to-course](https://github.com/KaguraTart/paper-to-course)，主要改动面向 Codex 使用方式、插件元数据、依赖安装，以及本地论文/课程生成流程。

- **交互式 HTML 课程**：单页滚动课程，支持公式拆解、发展时间线、方法对比、消融图、组件对话动画和测验。
- **Markdown 学习笔记**：保留表格、公式、代码块，适合继续编辑和分享。
- **PPTX 演示文稿**：基于 JSON 配置生成 16 页组会/课堂汇报幻灯片。

## 快速开始

### 方法一：复制到 Codex skills 目录

```bash
mkdir -p ~/.codex/skills
cp -r paper-to-course ~/.codex/skills/
```

### 方法二：通过 GitHub 安装

如果你的 Codex 环境支持 `npx skills add`：

```bash
npx skills add KaguraTart/paper-to-course
```

安装构建流水线所需的 Node 依赖：

```bash
npm install
```

### 使用方式

在 Codex 中打开任意工作区，然后输入：

```text
Use paper-to-course on papers/your-paper.pdf
```

也可以直接说：

```text
把这篇论文转成课程。
```

Codex 会先读取论文并确认主题，然后自动生成 HTML 课程、Markdown 笔记和 PPTX 幻灯片。

建议把待处理的 PDF 或 LaTeX 项目放在 `papers/` 目录中。该目录会保留在 Git 中，但其中论文文件默认被忽略，避免误提交本地论文。

## 输出内容

| 输出 | 文件 | 说明 |
|------|------|------|
| HTML 课程 | `index.html` | 自包含交互式单页课程，离线可用 |
| Markdown 笔记 | `README.md` | 纯文本学习资料，保留公式、表格和代码 |
| PPTX 幻灯片 | `slides.pptx` | 16 页组会或课堂汇报幻灯片 |

## 功能特色

- **7 种交互元素**：公式拆解、发展时间线、方法对比表、消融图、组件对话、理解测验、术语提示。
- **6 模块课程体系**：问题与动机、发展脉络、主流方法对比、方法详解、实验与验证、局限与展望。
- **通用 PPTX 生成器**：由 `slides-config.json` 驱动，适用于多数工科和研究论文。
- **单文件 HTML 输出**：无需服务器，浏览器直接打开即可使用。

## 项目结构

```text
paper-to-course/
├── .codex-plugin/
│   └── plugin.json          # Codex 插件元数据
├── papers/                  # 待处理论文，本地文件默认不提交
├── SKILL.md                 # Codex 技能说明
├── README.md / README_zh.md # 中英双语文档
├── scripts/
│   ├── build-all.js         # 统一流水线：HTML + Markdown + PPTX
│   ├── generate-pptx.js     # 通用 PPTX 生成器
│   ├── slides-builder.js    # PPTX 构建核心
│   └── html-to-md.js        # HTML 转 Markdown
└── references/
    ├── styles.css           # 设计系统
    ├── main.js              # 交互引擎
    ├── _base.html           # HTML 模板头部
    ├── _footer.html         # HTML 模板尾部
    └── paper-elements.md    # 7 种交互元素实现模式
```

## 构建流水线

当 Codex 生成课程目录后，可以运行：

```bash
node scripts/build-all.js ./my-paper-course --output ./output
```

常用命令：

```bash
node scripts/build-all.js ./my-paper-course --zh --output ./output
node scripts/build-all.js ./my-paper-course --en
node scripts/build-all.js ./output --slides-only
```

PPTX 生成是本工作流的必要功能。它依赖 `pptxgenjs`，可通过本仓库的 `package.json` 执行 `npm install` 安装。

## 环境要求

- 支持本地 skill 的 Codex。
- Node.js，用于 Markdown 和 PPTX 生成。
- `pptxgenjs`，用于必要的 PPTX 生成。执行 `npm install` 即可安装。
- Chrome 或 Chromium（用于截图相关步骤）。
- PDF 或 LaTeX 格式论文。

## 协议

MIT License。可自由使用、修改和分发。
