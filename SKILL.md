---
name: paper-to-course
description: 将学术论文转换为交互式 HTML 课程 + Markdown + PPTX，适用于所有工科论文
---

# Paper-to-Course Skill

将任意学术论文转换成交互式 HTML 课程 + Markdown 文档 + PPTX 演示文稿，帮助研究者和学习者系统理解论文的问题、背景、方法、实验和发展脉络。

## 目标用户

- **研究者**：快速摸底某篇论文的核心贡献、技术细节和实验结果
- **学生/新人**：系统学习某个领域，通过论文理解整个发展脉络

## 输出格式（三种）

1. **HTML 课程** — 交互式单页，支持公式、时间线、对比表、消融图、对话动画、测验、术语提示
2. **Markdown 文档** — 纯文本版本，代码块、LaTeX 公式、表格均保留，适合快速浏览或导出
3. **PPTX 演示文稿** — 通用幻灯片系统，通过 JSON 配置生成，适用于所有工科论文

## 课程模块设计（6个模块）

| 模块 | 名称 | 核心内容 |
|------|------|---------|
| 1 | 问题与动机 | 背景问题、现有方法瓶颈、核心研究问题 |
| 2 | 发展脉络 | 领域演进时间线、代表性方法、关键突破节点 |
| 3 | 主流方法对比 | 当前主流方法、优缺点分析、可交互对比表格 |
| 4 | 方法详解 | 核心架构图、公式逐行解读、组件对话动画、算法流程 |
| 5 | 实验与验证 | 实验设置、SOTA对比、消融实验可视化 |
| 6 | 局限与展望 | 本文局限性、开放问题、未来研究方向 |

## 交互元素（HTML 课程专用）

详见 `references/paper-elements.md`：

| 元素 | 功能 |
|------|------|
| **Formula Breakdown** | 数学公式逐行通俗解释 |
| **Literature Timeline** | 领域发展时间线动画 |
| **Method Chat** | 组件间"对话"动画 |
| **Comparison Table** | 可交互对比表格 |
| **Ablation Diagram** | 消融实验可视化 |
| **Quiz** | 选择题理解测验 |
| **Glossary Tooltips** | 术语悬停通俗解释 |

## PPTX 幻灯片类型（通用）

PPTX 生成器完全基于 JSON 配置，**适用于所有工科论文**：

| Type | 说明 |
|------|------|
| `outline` | 双栏编号列表 |
| `content` | bullets / cards-2/3/4 / grid-2x2 / steps |
| `flow` | 水平流程管道（编号方块 + 箭头） |
| `table` | 多列对比表 |
| `bars` | 水平条形图 |
| `stats` | 大数字统计卡片 |
| `formula` | 公式 + 逐行解释 |
| `quote` | 核心启示引用框 |
| `timeline` | 垂直时间线（年份 → 标题 → 描述） |
| `summary` | 双栏总结卡片 |

### slides-config.json 示例

```json
{
  "title": "论文标题",
  "subtitle": "副标题",
  "slides": [
    { "type": "outline", "items": ["第一部分", "第二部分", "第三部分"] },
    { "type": "content", "title": "背景", "layout": "cards-3",
      "cards": [
        { "title": "问题A", "text": "描述", "color": "#D94F30" },
        { "title": "问题B", "text": "描述", "color": "#7C3AED" }
      ]
    },
    { "type": "table", "title": "Benchmark 对比",
      "headers": ["模型", "Score"],
      "rows": [["A", "90%"], ["B", "85%"]]
    },
    { "type": "bars", "title": "消融实验",
      "items": [
        { "label": "完整模型", "value": 96, "baseline": 100, "isBaseline": true },
        { "label": "w/o GRPO", "value": 80, "drop": 16 }
      ]
    }
  ]
}
```

## 文件结构

```
paper-to-course/
├── SKILL.md                    # 本技能说明
├── README.md / README_zh.md    # 安装使用文档（中英双语）
├── examples/                  # 示例课程
│   └── deepseek-r1-zh/       # DeepSeek-R1 示例
│       ├── modules/           # HTML 模块源文件
│       ├── slides-config.json # 通用幻灯片配置
│       └── assets/            # CSS/JS（从 references/ 复制）
├── scripts/
│   ├── build-all.js          # 统一流水线：HTML + MD + PPTX + 截图
│   ├── generate-pptx.js      # 通用 PPTX 生成器（JSON 配置驱动）
│   └── html-to-md.js         # HTML → Markdown 转换器
└── references/                 # 设计系统
    ├── styles.css             # 完整设计系统
    ├── main.js               # 交互引擎
    ├── _base.html            # HTML 模板头部
    ├── _footer.html          # HTML 模板尾部
    └── paper-elements.md      # 7 种交互元素实现模式
```

## 使用流程

1. 用户指定论文（PDF 或 LaTeX 源码路径）
2. 分析论文结构：Abstract → Related Work → Method → Experiments → Conclusion
3. 设计 6 模块课程内容
4. 为每个模块生成 HTML 文件到 `modules/` 目录
5. 复制 `references/` 中的 CSS/JS 到课程目录
6. 运行 `node scripts/build-all.js <paper-name> --zh` 生成所有输出

## PPTX 生成

```bash
# 方式一：使用 JSON 配置生成（通用）
node scripts/generate-pptx.js output.pptx --config slides-config.json

# 方式二：通过 build-all.js 自动生成
node scripts/build-all.js <paper-name> --zh
```

PPTX 设计风格：白底、炭灰标题栏、珊瑚红强调色、Arial Black + Calibri 字体、16:9 宽屏。

## 设计规范

- 暖色调"开发者笔记本"美学：米白背景 + 珊瑚红强调色
- 字体：Bricolage Grotesque (标题) + DM Sans (正文) + JetBrains Mono (公式/代码)
- 所有 CSS/JS 集中在 `references/styles.css` 和 `references/main.js`
- 模块 HTML 只引用 class，不写内联样式

## 参考资源

- `references/styles.css` — 完整设计系统和 CSS class
- `references/main.js` — 交互引擎（动画、测验、工具提示等）
- `references/_base.html` — HTML 模板头部
- `references/_footer.html` — HTML 模板尾部
- `references/paper-elements.md` — 7 种论文专用交互元素的实现模式
- `scripts/generate-pptx.js` — 通用 PPTX 生成器（JSON 配置驱动）
- `scripts/html-to-md.js` — HTML → Markdown 转换器
- `scripts/build-all.js` — 统一构建流水线
