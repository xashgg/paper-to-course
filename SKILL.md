---
name: paper-to-course
description: 将学术论文转换成交互式 HTML 课程，面向研究者和学习者
---

# Paper-to-Course Skill

将任意学术论文转换成交互式单页 HTML 课程，帮助研究者和学习者系统理解论文的问题、背景、方法、实验和发展脉络。

## 目标用户

两类用户同时覆盖：
- **研究者**：快速摸底某篇论文的核心贡献、技术细节和实验结果
- **学生/新人**：系统学习某个领域，通过论文理解整个发展脉络

## 课程模块设计（6个模块）

### Module 1: 问题与动机 (Problem & Motivation)
- 背景问题是什么，为什么重要
- 现有方法的瓶颈在哪里
- 本文要解决什么核心问题
- 交互元素：问题背景图 + Glossary Tooltips

### Module 2: 发展脉络 (Literature Timeline)
- 该领域如何演进（时间线动画）
- 各阶段代表性方法
- 关键突破节点
- 交互元素：**Literature Timeline**（时间线动画）

### Module 3: 主流方法对比 (State-of-the-Art Comparison)
- 当前有哪些主流方法
- 各方法的优缺点分析
- 可交互对比表格
- 交互元素：**Comparison Table** + 悬停详细分析

### Module 4: 本文方法详解 (Method Deep-Dive)
- 核心架构图（可交互，悬停显示组件描述）
- 关键公式逐行通俗解读
- 组件间"对话"动画
- 算法流程图
- 交互元素：**Formula Breakdown** + **Method Chat** + 架构图

### Module 5: 实验与验证 (Experiments & Results)
- 实验设置与基准
- 与 SOTA 方法对比（柱状图/折线图）
- 消融实验分析
- 交互元素：**Ablation Diagram** + 图表动画

### Module 6: 局限与展望 (Limitations & Future Work)
- 本文方法的局限性
- 开放问题
- 未来研究方向
- 交互元素：文字 + 图示 + 小测验

## 必须包含的交互元素

每个课程必须包含以下元素（详见 `references/paper-elements.md`）：

- **Formula Breakdown** — 数学公式逐行通俗解释，聚焦"为什么"而非"是什么"
- **Literature Timeline** — 领域发展时间线动画，展示关键节点和方法演进
- **Method Chat** — 不同方法/组件之间的"对话"动画，解释交互逻辑
- **Comparison Table** — 可交互对比表格，悬停显示详细分析
- **Ablation Diagram** — 消融实验可视化，直观展示各组件贡献度
- **Quiz: Paper Comprehension** — 选择题测试论文理解程度
- **Glossary Tooltips** — 专业术语悬停通俗解释

## 设计规范

- 暖色调"开发者笔记本"美学：米白背景 (#FAF7F2) + 珊瑚红强调色 (#D94F30)
- 字体：Bricolage Grotesque (标题) + DM Sans (正文) + JetBrains Mono (公式/代码)
- 所有 CSS/JS 集中在 `references/styles.css` 和 `references/main.js`
- 模块 HTML 只引用 class，不写内联样式

## 文件结构

```
course-name/
  _base.html        ← HTML 模板头部
  _footer.html      ← HTML 模板尾部
  styles.css        ← 从 references/ 复制
  main.js           ← 从 references/ 复制
  module-01.html    ← Module 1: 问题与动机
  module-02.html    ← Module 2: 发展脉络
  module-03.html    ← Module 3: 主流方法对比
  module-04.html    ← Module 4: 本文方法详解
  module-05.html    ← Module 5: 实验与验证
  module-06.html    ← Module 6: 局限与展望
  build.sh          ← 打包脚本
  index.html        ← 最终输出
```

## 使用方法

1. 用户指定一篇论文（PDF 或 LaTeX 源码路径）
2. 分析论文结构：Abstract / Introduction / Related Work / Method / Experiments / Conclusion
3. 设计 6 个教学模块的详细内容
4. 为每个模块生成 HTML 文件
5. 从 `~/.claude/skills/paper-to-course/references/` 复制 CSS/JS/模板文件到课程目录
6. 运行 `bash build.sh` 打包为 `index.html`
7. 告知用户在浏览器中打开 `index.html` 即可查看

## PPTX 演示文稿生成（组会汇报用）

除了 HTML 课程，还可以生成用于组会汇报的 PPTX 演示文稿（简约白色风格）。

### 使用方法

1. 安装依赖：
```bash
npm install -g pptxgenjs
```

2. 生成 PPTX：
```bash
cd ~/.claude/skills/paper-to-course
node scripts/generate-pptx.js output.pptx
```

3. 转换为 PDF（如需要）：
```bash
libreoffice --headless --convert-to pdf output.pptx --outdir .
```

### PPTX 设计风格

- **背景**：纯白 (#FFFFFF)
- **标题栏**：深炭灰 (#36454F)
- **强调色**：珊瑚红 (#D94F30)
- **卡片背景**：浅灰 (#F0F0F0)
- **字体**：Arial Black（标题）+ Calibri（正文）
- **布局**：16:9 宽屏

### PPTX 幻灯片结构（16页）

| 页码 | 内容 |
|------|------|
| 1 | 标题页 |
| 2 | 汇报提纲 |
| 3 | 研究背景 |
| 4 | 现有方法的瓶颈 |
| 5 | 核心研究问题 |
| 6 | 发展脉络时间线 |
| 7 | Benchmark 性能对比表 |
| 8 | GRPO 算法详解（步骤流程） |
| 9 | 四阶段训练管道 |
| 10 | 奖励信号设计 |
| 11 | 核心实验结果（大数字卡片） |
| 12 | 消融实验（水平条形图） |
| 13 | 涌现的高级推理行为（2×2 卡片） |
| 14 | 蒸馏效果对比表 |
| 15 | 局限性与未来方向（双栏布局） |
| 16 | 总结与启示 |

### 自定义 PPTX

修改 `scripts/generate-pptx.js` 中的颜色常量和工作函数，可自定义：
- 配色方案（修改 `C` 对象）
- 幻灯片内容（修改对应 slide 函数）
- 布局结构（修改卡片网格参数）

## 参考资源

- `references/styles.css` — 完整设计系统和 CSS class
- `references/main.js` — 交互引擎（动画、测验、工具提示等）
- `references/build.sh` — 打包脚本
- `references/_base.html` — HTML 模板头部
- `references/_footer.html` — HTML 模板尾部
- `references/paper-elements.md` — 7 种论文专用交互元素的实现模式
- `scripts/generate-pptx.js` — PPTX 演示文稿生成脚本
