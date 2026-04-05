#!/usr/bin/env node
/**
 * paper-to-course PPTX Generator
 * Generates a clean, minimal PPTX for group meeting presentations.
 *
 * Usage:
 *   node generate-pptx.js [output.pptx]
 *
 * Design:
 *   - White background (clean, minimal)
 *   - Charcoal text (#36454F) on white
 *   - Coral accent (#D94F30) for highlights
 *   - Light gray cards (#F5F5F5) for structured content
 *   - Font: Arial Black (headers) + Calibri (body)
 */

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// ─── Color Palette ──────────────────────────────────────────────
const C = {
  white:      "FFFFFF",
  offWhite:   "FAFAFA",
  lightGray:  "F0F0F0",
  midGray:    "D1D5DB",
  darkGray:   "6B7280",
  charcoal:   "36454F",
  black:      "1F2937",
  coral:      "D94F30",
  coralDark:  "B33E24",
  blue:       "3B82F6",
  green:      "10B981",
  purple:     "7C3AED",
};

// ─── Helpers ─────────────────────────────────────────────────────
function addSlideNumber(slide, total) {
  slide.addText(`${total}`, {
    x: 9.3, y: 5.3, w: 0.4, h: 0.25,
    fontSize: 9, color: C.darkGray, align: "right", margin: 0
  });
}

function titleSlide(pres, text, subtitle) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Top accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.coral }
  });

  // Title
  slide.addText(text, {
    x: 0.6, y: 1.8, w: 8.8, h: 1.5,
    fontSize: 36, fontFace: "Arial", bold: true,
    color: C.charcoal, align: "left", valign: "middle", margin: 0
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 3.4, w: 8.8, h: 0.6,
      fontSize: 16, fontFace: "Calibri",
      color: C.darkGray, align: "left", margin: 0
    });
  }

  // Bottom accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.55, w: 10, h: 0.075, fill: { color: C.coral }
  });

  return slide;
}

function contentSlide(pres, slideNum, title, contentFn) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Header bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.7, fill: { color: C.charcoal }
  });

  // Title text
  slide.addText(title, {
    x: 0.5, y: 0.12, w: 8.5, h: 0.46,
    fontSize: 18, fontFace: "Arial", bold: true,
    color: C.white, align: "left", valign: "middle", margin: 0
  });

  // Slide number
  slide.addText(`${slideNum}`, {
    x: 9.3, y: 0.15, w: 0.4, h: 0.35,
    fontSize: 12, fontFace: "Calibri", bold: true,
    color: C.coral, align: "right", valign: "middle", margin: 0
  });

  // Bottom line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.55, w: 10, h: 0.075, fill: { color: C.midGray }
  });

  // Content
  if (contentFn) contentFn(slide);

  return slide;
}

function bulletSlide(pres, slideNum, title, items, options = {}) {
  return contentSlide(pres, slideNum, title, (slide) => {
    const startY = options.startY || 0.95;
    const indent = options.indent || 0;
    const bulletItems = items.map((item, i) => ({
      text: item,
      options: {
        bullet: true,
        breakLine: i < items.length - 1,
        color: C.charcoal,
        fontSize: options.fontSize || 15,
        fontFace: "Calibri",
        indentLevel: indent,
      }
    }));
    slide.addText(bulletItems, {
      x: 0.5, y: startY, w: 9, h: 4.2,
      valign: "top", paraSpaceAfter: 10
    });
  });
}

function cardSlide(pres, slideNum, title, cards) {
  return contentSlide(pres, slideNum, title, (slide) => {
    const cols = Math.min(cards.length, 3);
    const cardW = (9 - (cols + 1) * 0.25) / cols;
    const startX = 0.5;
    const startY = 0.95;
    const cardH = 4.0;

    cards.forEach((card, i) => {
      const col = i % cols;
      const x = startX + col * (cardW + 0.25);

      // Card background
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: startY, w: cardW, h: cardH,
        fill: { color: C.lightGray },
        shadow: { type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.06 }
      });

      // Accent top bar
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: startY, w: cardW, h: 0.05,
        fill: { color: card.color || C.coral }
      });

      // Card title
      slide.addText(card.title, {
        x: x + 0.15, y: startY + 0.18, w: cardW - 0.3, h: 0.5,
        fontSize: 13, fontFace: "Arial", bold: true,
        color: C.charcoal, align: "left", valign: "top", margin: 0
      });

      // Card content
      if (Array.isArray(card.text)) {
        const bulletItems = card.text.map((t, j) => ({
          text: t,
          options: { bullet: true, breakLine: j < card.text.length - 1, color: C.charcoal, fontSize: 11, fontFace: "Calibri" }
        }));
        slide.addText(bulletItems, {
          x: x + 0.15, y: startY + 0.7, w: cardW - 0.3, h: cardH - 0.9,
          valign: "top", paraSpaceAfter: 6
        });
      } else {
        slide.addText(card.text, {
          x: x + 0.15, y: startY + 0.7, w: cardW - 0.3, h: cardH - 0.9,
          fontSize: 11, fontFace: "Calibri", color: C.charcoal,
          align: "left", valign: "top", margin: 0
        });
      }
    });
  });
}

function tableSlide(pres, slideNum, title, headers, rows, highlightRows) {
  return contentSlide(pres, slideNum, title, (slide) => {
    const tableData = [
      headers.map(h => ({
        text: h,
        options: { fill: { color: C.charcoal }, color: C.white, bold: true, fontSize: 11, fontFace: "Calibri", align: "center", valign: "middle" }
      })),
      ...rows.map((row, ri) =>
        row.map((cell, ci) => ({
          text: cell,
          options: {
            fill: { color: (highlightRows && highlightRows.includes(ri)) ? "FEF2F2" : C.white },
            color: C.charcoal,
            fontSize: 11,
            fontFace: "Calibri",
            align: ci === 0 ? "left" : "center",
            valign: "middle",
            bold: (highlightRows && highlightRows.includes(ri)) && ci === 0,
          }
        }))
      )
    ];

    const colCount = headers.length;
    const colW = 9 / colCount;

    slide.addTable(tableData, {
      x: 0.5, y: 1.0, w: 9,
      colW: colCount === 6 ? [2.2, 1.2, 1.1, 1.1, 1.5, 1.9] :
            colCount === 4 ? [2.5, 1.2, 1.2, 4.1] :
            colCount === 3 ? [3, 3, 3] : Array(colCount).fill(9 / colCount),
      border: { pt: 0.5, color: C.midGray },
      fontFace: "Calibri",
    });
  });
}

function bigStatSlide(pres, slideNum, title, stats) {
  return contentSlide(pres, slideNum, title, (slide) => {
    const cols = stats.length;
    const totalW = 9;
    const gap = 0.4;
    const cardW = (totalW - gap * (cols - 1)) / cols;
    const startX = 0.5;
    const startY = 1.1;
    const cardH = 2.2;

    stats.forEach((stat, i) => {
      const x = startX + i * (cardW + gap);

      // Background (use stronger contrast colors)
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: startY, w: cardW, h: cardH,
        fill: { color: stat.bgColor || C.lightGray }
      });

      // Top accent bar
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: startY, w: cardW, h: 0.05,
        fill: { color: stat.color || C.coral }
      });

      // Big number
      slide.addText(stat.value, {
        x, y: startY + 0.2, w: cardW, h: 1.0,
        fontSize: stat.big ? 44 : 36, fontFace: "Arial", bold: true,
        color: stat.color || C.coral, align: "center", valign: "middle", margin: 0
      });

      // Label
      slide.addText(stat.label, {
        x: x + 0.1, y: startY + 1.25, w: cardW - 0.2, h: 0.85,
        fontSize: 11, fontFace: "Calibri",
        color: C.charcoal, align: "center", valign: "top", margin: 0
      });
    });
  });
}

// ─── DeepSeek-R1 Presentation ─────────────────────────────────────
function createDeepSeekR1Presentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "DeepSeek-R1: 纯强化学习驱动的推理能力涌现";
  pres.author = "Paper-to-Course";
  pres.subject = "DeepSeek-R1 Paper Summary";

  let slideNum = 0;
  const totalSlides = 16;

  // ── Slide 1: Title ──
  slideNum++;
  titleSlide(
    pres,
    "DeepSeek-R1",
    "纯强化学习驱动的推理能力涌现\nPure Reinforcement Learning Elicits Reasoning in LLMs\nNature, 2025"
  );
  addSlideNumber(pres.slides[pres.slides.length - 1], `${slideNum}/${totalSlides}`);

  // ── Slide 2: Outline ──
  slideNum++;
  const outlineItems = [
    "研究背景与动机",
    "发展脉络与主流方法对比",
    "核心方法：GRPO 算法详解",
    "实验结果与消融分析",
    "局限性与未来方向",
  ];
  bulletSlide(pres, slideNum, "汇报提纲", outlineItems, { fontSize: 17, startY: 1.0 });

  // ── Slide 3: Background ──
  slideNum++;
  cardSlide(pres, slideNum, "研究背景：大模型的推理困境", [
    {
      title: "数学推理",
      color: C.coral,
      text: "多步代数推导、几何证明、奥数竞赛题——LLM 常给出\"看起来对但错了\"的答案"
    },
    {
      title: "代码生成与调试",
      color: C.purple,
      text: "复杂算法、多文件协调、边界条件处理——需要系统化思考而非模式匹配"
    },
    {
      title: "科学分析",
      color: C.green,
      text: "假设检验、实验设计、数据解读——需要领域知识与逻辑链条的深度结合"
    },
  ]);

  // ── Slide 4: Bottlenecks ──
  slideNum++;
  bulletSlide(pres, slideNum, "现有方法的三大瓶颈", [
    "需要大量标注数据 — 传统 RLHF 依赖海量高质量\"人类反馈数据\"，成本极高",
    "必须先做 SFT（监督微调） — GPT-4o、Claude 等都需要先经过 SFT 才能做 RL",
    "推理链质量不可控 — CoT prompting 可以引导思考，但模型无法验证推理步骤正确性",
  ], { fontSize: 16, startY: 1.0 });

  // ── Slide 5: Research Question ──
  slideNum++;
  contentSlide(pres, slideNum, "核心研究问题", (slide) => {
    // Quote box
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.1, w: 9, h: 2.0,
      fill: { color: C.lightGray },
      shadow: { type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.06 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.1, w: 0.06, h: 2.0,
      fill: { color: C.coral }
    });
    slide.addText([
      { text: "\"大语言模型能否通过", options: { fontSize: 18, color: C.charcoal, fontFace: "Calibri" } },
      { text: "纯强化学习", options: { fontSize: 18, color: C.coral, bold: true, fontFace: "Arial" } },
      { text: "，不依赖任何监督微调，自主涌现出", options: { fontSize: 18, color: C.charcoal, fontFace: "Calibri" } },
      { text: "推理能力", options: { fontSize: 18, color: C.coral, bold: true, fontFace: "Arial" } },
      { text: "？\"", options: { fontSize: 18, color: C.charcoal, fontFace: "Calibri" } },
    ], {
      x: 0.8, y: 1.3, w: 8.5, h: 1.6,
      valign: "middle", align: "left", margin: 0
    });

    // Explanation
    slide.addText([
      { text: "• ", options: { color: C.coral, fontSize: 14, bold: true } },
      { text: "纯 RL", options: { color: C.charcoal, fontSize: 14, bold: true } },
      { text: " — 完全摒弃 SFT，从零开始训练（类比：AlphaGo 不学人类棋谱，自我对弈超越人类）", options: { color: C.charcoal, fontSize: 14, breakLine: true } },
      { text: "• ", options: { color: C.coral, fontSize: 14, bold: true } },
      { text: "推理涌现", options: { color: C.charcoal, fontSize: 14, bold: true } },
      { text: " — 不是教模型\"怎么推理\"，而是创造条件让推理能力自己涌现出来", options: { color: C.charcoal, fontSize: 14 } },
    ], {
      x: 0.5, y: 3.3, w: 9, h: 2,
      valign: "top", paraSpaceAfter: 8
    });
  });

  // ── Slide 6: Timeline ──
  slideNum++;
  contentSlide(pres, slideNum, "发展脉络：从\"教\"到\"涌现\"", (slide) => {
    const milestones = [
      { year: "2022", label: "CoT Prompting", desc: "Wei et al. — 引导思考，但无法真正教会推理" },
      { year: "2022", label: "RLHF / InstructGPT", desc: "OpenAI — 依赖大量人工标注数据" },
      { year: "2024.09", label: "OpenAI o1", desc: "Extended Thinking — 黑箱，AIME 74.6%" },
      { year: "2025.01", label: "DeepSeek-R1-Zero", desc: "纯 RL，涌现反思能力！无标注数据" },
      { year: "2025.01", label: "DeepSeek-R1", desc: "冷启动 + RL + SFT，追平 o1，全开源" },
    ];

    const startY = 0.95;
    const itemH = 0.8;
    const barX = 0.5;

    milestones.forEach((m, i) => {
      const y = startY + i * itemH;

      // Year badge
      slide.addShape(pres.shapes.RECTANGLE, {
        x: barX, y, w: 0.85, h: 0.5,
        fill: { color: i >= 3 ? C.coral : C.charcoal }
      });
      slide.addText(m.year, {
        x: barX, y, w: 0.85, h: 0.5,
        fontSize: 9, fontFace: "Calibri", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });

      // Arrow
      slide.addText("→", {
        x: barX + 0.9, y, w: 0.3, h: 0.5,
        fontSize: 14, color: C.darkGray, align: "center", valign: "middle", margin: 0
      });

      // Method name
      slide.addText(m.label, {
        x: barX + 1.2, y, w: 2.0, h: 0.5,
        fontSize: 12, fontFace: "Arial", bold: true,
        color: i >= 3 ? C.coral : C.charcoal, align: "left", valign: "middle", margin: 0
      });

      // Description
      slide.addText(m.desc, {
        x: barX + 3.2, y, w: 6.3, h: 0.5,
        fontSize: 11, fontFace: "Calibri",
        color: C.darkGray, align: "left", valign: "middle", margin: 0
      });

      // Divider
      if (i < milestones.length - 1) {
        slide.addShape(pres.shapes.LINE, {
          x: barX, y: y + 0.6, w: 9, h: 0,
          line: { color: C.lightGray, width: 0.5 }
        });
      }
    });
  });

  // ── Slide 7: Comparison Table ──
  slideNum++;
  tableSlide(pres, slideNum, "Benchmark 性能对比", [
    "模型", "方法", "AIME 2024", "MATH-500", "LiveCodeBench", "GPQA"
  ], [
    ["GPT-4o (2024)",     "SFT + RLHF",          "9.3%",   "75.9%",  "11.0%",  "49.9%"],
    ["Claude 3.5 Sonnet", "SFT + RLHF",          "16.7%",  "78.3%",  "21.2%",  "65.0%"],
    ["OpenAI o1",        "Extended Thinking",     "74.6%",  "85.5%",  "52.3%",  "75.7%"],
    ["DeepSeek-R1-Zero", "Pure RL",              "71.0%",  "96.2%",  "54.1%",  "—"],
    ["DeepSeek-R1",      "Cold Start + RL + SFT","76.0%",  "96.2%",  "62.2%",  "71.3%"],
  ], [4]);

  // ── Slide 8: GRPO Overview ──
  slideNum++;
  contentSlide(pres, slideNum, "核心算法：GRPO", (slide) => {
    // Step 1
    slide.addShape(pres.shapes.OVAL, { x: 0.5, y: 1.0, w: 0.5, h: 0.5, fill: { color: C.coral } });
    slide.addText("1", { x: 0.5, y: 1.0, w: 0.5, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    slide.addText("模型对每个问题生成 G=8 个不同答案 [S₁, S₂, ..., S₈]", {
      x: 1.1, y: 1.05, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.charcoal, align: "left", valign: "middle", margin: 0
    });

    // Arrow
    slide.addText("↓", { x: 0.5, y: 1.55, w: 0.5, h: 0.4, fontSize: 16, color: C.darkGray, align: "center", valign: "middle", margin: 0 });

    // Step 2
    slide.addShape(pres.shapes.OVAL, { x: 0.5, y: 2.0, w: 0.5, h: 0.5, fill: { color: C.coral } });
    slide.addText("2", { x: 0.5, y: 2.0, w: 0.5, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    slide.addText("奖励模型打分：[r₁=0, r₂=1, r₃=0, r₄=0, r₅=1, r₆=0, r₇=0, r₈=0] — 两个正确", {
      x: 1.1, y: 2.05, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.charcoal, align: "left", valign: "middle", margin: 0
    });

    // Arrow
    slide.addText("↓", { x: 0.5, y: 2.55, w: 0.5, h: 0.4, fontSize: 16, color: C.darkGray, align: "center", valign: "middle", margin: 0 });

    // Step 3
    slide.addShape(pres.shapes.OVAL, { x: 0.5, y: 3.0, w: 0.5, h: 0.5, fill: { color: C.coral } });
    slide.addText("3", { x: 0.5, y: 3.0, w: 0.5, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    slide.addText("GRPO 在组内标准化 Advantage（Aᵢ = (rᵢ − μ) / σ），无需 Critic 网络", {
      x: 1.1, y: 3.05, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.charcoal, align: "left", valign: "middle", margin: 0
    });

    // Arrow
    slide.addText("↓", { x: 0.5, y: 3.55, w: 0.5, h: 0.4, fontSize: 16, color: C.darkGray, align: "center", valign: "middle", margin: 0 });

    // Step 4
    slide.addShape(pres.shapes.OVAL, { x: 0.5, y: 4.0, w: 0.5, h: 0.5, fill: { color: C.coral } });
    slide.addText("4", { x: 0.5, y: 4.0, w: 0.5, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    slide.addText("更新 π_θ，下次生成更多正确答案（PPO-style clip 防止更新过激）", {
      x: 1.1, y: 4.05, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.charcoal, align: "left", valign: "middle", margin: 0
    });

    // Key insight box
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.6, w: 9, h: 0.75,
      fill: { color: "FEF2F2" }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.6, w: 0.06, h: 0.75,
      fill: { color: C.coral }
    });
    slide.addText([
      { text: "核心创新：", options: { bold: true, color: C.coral, fontSize: 12 } },
      { text: "用组内均值/标准差替代 Critic 网络估计 Advantage，大幅降低训练开销！", options: { color: C.charcoal, fontSize: 12 } }
    ], { x: 0.7, y: 4.6, w: 8.6, h: 0.75, valign: "middle", margin: 0 });
  });

  // ── Slide 9: Four-Stage Pipeline ──
  slideNum++;
  contentSlide(pres, slideNum, "四阶段训练管道", (slide) => {
    const stages = [
      { num: "1", title: "冷启动", subtitle: "Cold Start", desc: "用长 CoT 数据微调\n解决 R1-Zero\n可读性问题", color: C.darkGray },
      { num: "2", title: "RL（推理）", subtitle: "GRPO + 奖励", desc: "GRPO + 准确性奖励\n+ 格式奖励\n聚焦推理任务", color: C.coral },
      { num: "3", title: "SFT（全场景）", subtitle: "通用能力", desc: "阶段2数据 +\nDeepSeek-V3数据\n写作/对话/摘要", color: C.darkGray },
      { num: "4", title: "RL（全能力）", subtitle: "有用+无害", desc: "有用性奖励\n+ 无害性奖励\n全能力 RL", color: C.darkGray },
    ];

    const cardW = 2.0;
    const gap = 0.33;
    const startX = 0.5;
    const startY = 0.95;
    const cardH = 2.6;

    stages.forEach((s, i) => {
      const x = startX + i * (cardW + gap);

      // Background
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: startY, w: cardW, h: cardH,
        fill: { color: C.lightGray },
        shadow: { type: "outer", color: "000000", blur: 3, offset: 1, angle: 135, opacity: 0.05 }
      });

      // Number badge
      slide.addShape(pres.shapes.OVAL, {
        x: x + cardW / 2 - 0.25, y: startY + 0.15, w: 0.5, h: 0.5,
        fill: { color: s.color }
      });
      slide.addText(s.num, {
        x: x + cardW / 2 - 0.25, y: startY + 0.15, w: 0.5, h: 0.5,
        fontSize: 14, fontFace: "Arial", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });

      // Title
      slide.addText(s.title, {
        x: x + 0.1, y: startY + 0.75, w: cardW - 0.2, h: 0.45,
        fontSize: 12, fontFace: "Arial", bold: true,
        color: C.charcoal, align: "center", valign: "middle", margin: 0
      });

      // Subtitle
      slide.addText(s.subtitle, {
        x: x + 0.1, y: startY + 1.2, w: cardW - 0.2, h: 0.3,
        fontSize: 9, fontFace: "Calibri",
        color: C.darkGray, align: "center", valign: "middle", margin: 0
      });

      // Description
      slide.addText(s.desc, {
        x: x + 0.1, y: startY + 1.55, w: cardW - 0.2, h: 1.0,
        fontSize: 10, fontFace: "Calibri",
        color: C.darkGray, align: "center", valign: "top", margin: 0
      });

      // Arrow between cards
      if (i < stages.length - 1) {
        slide.addText("→", {
          x: x + cardW + 0.02, y: startY + cardH / 2 - 0.2, w: gap - 0.04, h: 0.4,
          fontSize: 18, color: C.midGray, align: "center", valign: "middle", margin: 0
        });
      }
    });
  });

  // ── Slide 10: Reward Design ──
  slideNum++;
  cardSlide(pres, slideNum, "奖励信号设计", [
    {
      title: "准确性奖励",
      color: C.green,
      text: [
        "二元判断：答案对/错",
        "最简单也最有效",
        "模型学会在错误后反思并纠正",
      ]
    },
    {
      title: "过程奖励",
      color: C.purple,
      text: [
        "给推理每一步打分",
        "而非只看最终答案",
        "帮助理解\"哪一步走错\"",
      ]
    },
    {
      title: "格式奖励",
      color: C.coral,
      text: [
        "强制 <think>...</think> 标签",
        "确保输出可解析",
        "鼓励更完整的思考链",
      ]
    },
  ]);

  // ── Slide 11: Key Results ──
  slideNum++;
  bigStatSlide(pres, slideNum, "核心实验结果", [
    { value: "76.0%", label: "AIME 2024 (数学竞赛)\n超越 OpenAI o1 (74.6%)", color: "991B1B", bgColor: "FEE2E2", big: true },
    { value: "96.2%", label: "MATH-500\n顶尖数学基准", color: "065F46", bgColor: "A7F3D0" },
    { value: "62.2%", label: "LiveCodeBench\n代码生成基准\n超越 o1 (52.3%)", color: "1E3A8A", bgColor: "BFDBFE" },
  ]);

  // ── Slide 12: Ablation ──
  slideNum++;
  contentSlide(pres, slideNum, "消融实验：哪些组件真正重要？", (slide) => {
    const ablations = [
      { label: "完整模型",       value: 96.2, full: true },
      { label: "w/o GRPO",      value: 80.6, drop: -15.6 },
      { label: "w/o Reward",    value: 60.8, drop: -35.4 },
      { label: "仅 SFT",        value: 74.8, drop: -21.4 },
    ];

    const barStartX = 0.5;
    const barStartY = 1.0;
    const barMaxW = 6.5;
    const barH = 0.75;
    const gap = 0.2;
    const barBaseX = barStartX + 1.4; // All bars start at same x

    ablations.forEach((a, i) => {
      const y = barStartY + i * (barH + gap);
      const barW = (a.value / 100) * barMaxW;

      // Label
      slide.addText(a.label, {
        x: barStartX, y, w: 1.35, h: barH,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: C.charcoal, align: "left", valign: "middle", margin: 0
      });

      // Bar (all bars start from barBaseX = 1.9)
      slide.addShape(pres.shapes.RECTANGLE, {
        x: barBaseX, y: y + 0.08, w: barW, h: barH - 0.16,
        fill: { color: a.full ? C.coral : "94A3B8" }
      });

      // Value label
      slide.addText(`${a.value}%`, {
        x: barBaseX + barW + 0.08, y, w: 0.55, h: barH,
        fontSize: 12, fontFace: "Arial", bold: true,
        color: a.full ? C.coral : C.charcoal, align: "left", valign: "middle", margin: 0
      });

      // Drop annotation
      if (a.drop) {
        slide.addText(`${a.drop}%`, {
          x: barBaseX + barW + 0.65, y, w: 0.65, h: barH,
          fontSize: 11, fontFace: "Calibri",
          color: C.coral, align: "left", valign: "middle", margin: 0
        });
      }
    });

    // Insight box
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.65, w: 9, h: 0.75,
      fill: { color: "FEF2F2" }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.65, w: 0.06, h: 0.75,
      fill: { color: C.coral }
    });
    slide.addText([
      { text: "关键发现：", options: { bold: true, color: C.coral, fontSize: 12 } },
      { text: "奖励信号是最关键因素（-35.4%）。纯 SFT 远不如 RL（-21.4%）。GRPO 本身贡献 +15.6%。", options: { color: C.charcoal, fontSize: 12 } }
    ], { x: 0.7, y: 4.65, w: 8.6, h: 0.75, valign: "middle", margin: 0 });
  });

  // ── Slide 13: Emergent Behaviors ──
  slideNum++;
  {
    const slide = contentSlide(pres, slideNum, "涌现的高级推理行为", () => {});

    const behaviors = [
      { icon: "🔄", title: "反思（Reflection）", desc: "模型主动回退并重新思考，\"等等，让我重新考虑……\"——从未被显式教过", color: C.purple },
      { icon: "⏱️", title: "长思维链", desc: "自发生成更长的思考过程。与 o1 异曲同工，但这里是纯 RL 涌现而非人工设计", color: C.coral },
      { icon: "📝", title: "问题分解", desc: "面对复杂问题，将问题拆解为子问题逐个攻克——高级元认知能力", color: C.green },
      { icon: "🔍", title: "验证（Verification）", desc: "在给出最终答案前，主动验证中间步骤的正确性，大大减少粗心错误", color: C.blue },
    ];

    // 2x2 grid layout
    const cols = 2;
    const cardW = 4.35;
    const cardH = 1.85;
    const gapX = 0.3;
    const gapY = 0.25;
    const startX = 0.5;
    const startY = 0.95;

    behaviors.forEach((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      // Background
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH,
        fill: { color: C.lightGray },
        shadow: { type: "outer", color: "000000", blur: 3, offset: 1, angle: 135, opacity: 0.06 }
      });

      // Accent top bar
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: 0.06,
        fill: { color: b.color }
      });

      // Icon + Title
      slide.addText(`${b.icon}  ${b.title}`, {
        x: x + 0.2, y: y + 0.18, w: cardW - 0.4, h: 0.45,
        fontSize: 13, fontFace: "Arial", bold: true,
        color: C.charcoal, align: "left", valign: "middle", margin: 0
      });

      // Description
      slide.addText(b.desc, {
        x: x + 0.2, y: y + 0.65, w: cardW - 0.4, h: 1.1,
        fontSize: 12, fontFace: "Calibri",
        color: C.charcoal, align: "left", valign: "top", margin: 0
      });
    });
  }

  // ── Slide 14: Distillation ──
  slideNum++;
  tableSlide(pres, slideNum, "蒸馏效果：小模型也能推理！", [
    "模型", "AIME 2024", "MATH-500", "参数量", "提升"
  ], [
    ["Qwen2.5-7B (基座)",          "2.3%",  "14.3%", "7B",   "—"],
    ["DeepSeek-R1-Distill-Qwen-7B","52.5%", "86.1%", "7B",   "↑22×"],
    ["Qwen2.5-32B (基座)",         "10.3%", "47.8%", "32B",  "—"],
    ["DeepSeek-R1-Distill-Qwen-32B","72.6%", "94.3%", "32B",  "↑7×"],
  ], [1, 3]);

  // ── Slide 15: Limitations & Future ──
  slideNum++;
  contentSlide(pres, slideNum, "局限性与未来方向", (slide) => {
    // Left: limitations
    slide.addText("当前局限", {
      x: 0.5, y: 0.9, w: 4.45, h: 0.4,
      fontSize: 13, fontFace: "Arial", bold: true,
      color: C.charcoal, align: "left", margin: 0
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.3, w: 4.45, h: 3.0,
      fill: { color: "FEF2F2" }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.3, w: 0.06, h: 3.0,
      fill: { color: C.coral }
    });

    const limits = [
      "语言一致性：推理过程常出现中英文混合",
      "函数调用/格式输出：不如专门的微调模型",
      "训练成本：671B 参数训练门槛极高",
      "冷启动数据：依赖人工后处理，难以自动化",
    ];
    slide.addText(limits.map((t, i) => ({
      text: t,
      options: { bullet: true, breakLine: i < limits.length - 1, color: C.charcoal, fontSize: 13, fontFace: "Calibri" }
    })), {
      x: 0.65, y: 1.4, w: 4.15, h: 2.8,
      valign: "top", paraSpaceAfter: 10
    });

    // Right: future work
    slide.addText("未来方向", {
      x: 5.05, y: 0.9, w: 4.45, h: 0.4,
      fontSize: 13, fontFace: "Arial", bold: true,
      color: C.charcoal, align: "left", margin: 0
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.05, y: 1.3, w: 4.45, h: 3.0,
      fill: { color: "F0FDF4" }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.05, y: 1.3, w: 0.06, h: 3.0,
      fill: { color: C.green }
    });

    const futures = [
      "多模态推理：扩展到图像、视频、音频",
      "更精细的奖励信号：过程奖励（每步打分）",
      "多智能体 RL 推理：假设+验证+整合协作",
      "推理效率优化：降低长思维链的推理成本",
    ];
    slide.addText(futures.map((t, i) => ({
      text: t,
      options: { bullet: true, breakLine: i < futures.length - 1, color: C.charcoal, fontSize: 13, fontFace: "Calibri" }
    })), {
      x: 5.2, y: 1.4, w: 4.15, h: 2.8,
      valign: "top", paraSpaceAfter: 10
    });
  });

  // ── Slide 16: Summary ──
  slideNum++;
  contentSlide(pres, slideNum, "总结与启示", (slide) => {
    const summary = [
      { icon: "🎯", text: "首次证明纯 RL 可让大模型涌现推理能力，无需任何监督数据", color: C.coral },
      { icon: "🔧", text: "GRPO 算法 + 四阶段训练管道 + 冷启动策略（技术创新）", color: C.charcoal },
      { icon: "🚀", text: "全系列开源（7B~671B），benchmark 上追平甚至超越 OpenAI o1", color: C.charcoal },
      { icon: "🔮", text: "核心启示：正确的奖励信号比标注数据更重要——模型会自己找到\"如何推理\"", color: C.coral },
    ];

    summary.forEach((s, i) => {
      const y = 0.95 + i * 1.05;

      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y, w: 9, h: 0.9,
        fill: { color: i % 2 === 0 ? C.lightGray : C.white }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y, w: 0.06, h: 0.9,
        fill: { color: s.color }
      });
      slide.addText(`${s.icon}  ${s.text}`, {
        x: 0.7, y, w: 8.6, h: 0.9,
        fontSize: 14, fontFace: "Calibri",
        color: C.charcoal, align: "left", valign: "middle", margin: 0
      });
    });
  });

  return pres;
}

// ─── Main ────────────────────────────────────────────────────────
const outputFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "..", "deepseek-r1-presentation.pptx");

const pres = createDeepSeekR1Presentation();

pres.writeFile({ fileName: outputFile })
  .then(() => {
    console.log(`✅ PPTX saved: ${outputFile}`);
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
