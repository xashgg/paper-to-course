#!/usr/bin/env node
/**
 * paper-to-course — Generic PPTX Generator
 *
 * Generates a clean PPTX presentation from a structured slide config.
 * Paper-agnostic: works for any engineering/research paper.
 *
 * Usage:
 *   node generate-pptx.js <output.pptx> [--config <slides.json>]
 *
 * Or require it:
 *   const { generatePPTX } = require('./generate-pptx.js');
 *   generatePPTX(slideConfig, 'output.pptx');
 *
 * ─── Slide Config Schema ────────────────────────────────────────────
 * {
 *   title: "Paper Title",
 *   subtitle: "Subtitle or paper name",
 *   authors: "Author et al.",
 *   venue: "Venue, Year",
 *   slides: [
 *     { type: "title" },
 *     { type: "outline", items: ["Section 1", ...] },
 *     { type: "content", title: "...", layout: "bullets", items: ["...", ...] },
 *     { type: "content", title: "...", layout: "cards-3", cards: [{title:"...",text:"..."},...] },
 *     { type: "content", title: "...", layout: "grid-2x2", cards: [{title:"...",text:"...",color:"#..."},...] },
 *     { type: "content", title: "...", layout: "steps", steps: [{num:"1",title:"...",text:"..."},...] },
 *     { type: "flow", title: "...", steps: ["Step 1", "→", "Step 2", ...] },
 *     { type: "table", title: "...", headers: [...], rows: [[...],...] },
 *     { type: "bars", title: "...", items: [{label:"...",value:90,baseline:100},...] },
 *     { type: "stats", title: "...", cards: [{value:"90%",label:"Metric\ndescription",color:"#..."},...] },
 *     { type: "formula", title: "...", formula: "LaTeX or plain text" },
 *     { type: "quote", title: "...", text: "..." },
 *     { type: "summary", title: "...", items: [{tag:"🔑",label:"...",text:"..."},...] },
 *     { type: "toc" },
 *   ]
 * }
 */

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// ─── Color Palette ────────────────────────────────────────────────
const C = {
  white:     "FFFFFF",
  offWhite:  "FAFAFA",
  lightGray: "F0F0F0",
  midGray:   "D1D5DB",
  darkGray:  "6B7280",
  charcoal:  "36454F",
  black:     "1F2937",
  coral:     "D94F30",
  coralDark: "B33E24",
  blue:      "1E3A8A",
  blueBg:    "BFDBFE",
  green:     "065F46",
  greenBg:   "D1FAE5",
  purple:    "4C1D95",
  purpleBg:  "EDE9FE",
  orange:    "92400E",
  orangeBg:  "FEF3C7",
};

// ─── Core API ────────────────────────────────────────────────────
function generatePPTX(slideConfig, outputPath) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = slideConfig.title || "Paper Presentation";
  pres.author = slideConfig.authors || "";

  const slides = slideConfig.slides || [];
  const total = slides.length + 1; // +1 for title slide

  // Title slide (always first)
  buildTitleSlide(pres, slideConfig, total);

  // Content slides
  slides.forEach((slide, i) => {
    buildSlide(pres, slide, i + 2, total);
  });

  pres.writeFile({ fileName: outputPath }).then(() => {
    console.log(`✅ PPTX saved: ${outputPath}`);
  }).catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

// ─── Slide Builders ──────────────────────────────────────────────
function buildTitleSlide(pres, cfg, total) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Top accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.coral }
  });

  // Main title
  slide.addText(cfg.title || "", {
    x: 0.6, y: 1.4, w: 8.8, h: 1.4,
    fontSize: 36, fontFace: "Arial", bold: true,
    color: C.charcoal, align: "left", valign: "middle", margin: 0
  });

  // Subtitle
  if (cfg.subtitle) {
    slide.addText(cfg.subtitle, {
      x: 0.6, y: 2.85, w: 8.8, h: 0.6,
      fontSize: 16, fontFace: "Calibri",
      color: C.darkGray, align: "left", valign: "top", margin: 0
    });
  }

  // Authors
  if (cfg.authors) {
    slide.addText(cfg.authors, {
      x: 0.6, y: 3.55, w: 8.8, h: 0.4,
      fontSize: 14, fontFace: "Calibri",
      color: C.darkGray, align: "left", valign: "top", margin: 0
    });
  }

  // Venue / Year
  if (cfg.venue) {
    slide.addText(cfg.venue, {
      x: 0.6, y: 4.0, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Calibri",
      color: C.darkGray, align: "left", valign: "top", margin: 0
    });
  }

  // Bottom bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.35, w: 10, h: 0.28, fill: { color: C.lightGray }
  });

  // Page number
  slide.addText(`1 / ${total}`, {
    x: 9.0, y: 5.35, w: 0.8, h: 0.28,
    fontSize: 9, fontFace: "Calibri",
    color: C.darkGray, align: "right", valign: "middle", margin: 0
  });
}

function buildSlide(pres, slide, num, total) {
  switch (slide.type) {
    case "outline":    buildOutlineSlide(pres, slide, num, total); break;
    case "content":   buildContentSlide(pres, slide, num, total); break;
    case "flow":      buildFlowSlide(pres, slide, num, total); break;
    case "table":     buildTableSlide(pres, slide, num, total); break;
    case "bars":      buildBarsSlide(pres, slide, num, total); break;
    case "stats":     buildStatsSlide(pres, slide, num, total); break;
    case "formula":   buildFormulaSlide(pres, slide, num, total); break;
    case "quote":     buildQuoteSlide(pres, slide, num, total); break;
    case "summary":   buildSummarySlide(pres, slide, num, total); break;
    case "timeline":  buildTimelineSlide(pres, slide, num, total); break;
    case "toc":       buildTocSlide(pres, slide, num, total); break;
    default:          buildContentSlide(pres, slide, num, total);
  }
}

// ─── Outline Slide ───────────────────────────────────────────────
function buildOutlineSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,"目录 / Outline", num, total);

  const items = slide.items || [];
  const cols = Math.ceil(items.length / 5);
  const colW = 4.3;
  const gap = 0.4;
  const startX = 0.5;

  items.forEach((item, i) => {
    const col = Math.floor(i / 5);
    const row = i % 5;
    const x = startX + col * (colW + gap);
    const y = 1.1 + row * 0.75;

    s.addShape(pres.shapes.OVAL, {
      x: x, y: y + 0.05, w: 0.35, h: 0.35,
      fill: { color: C.coral }
    });
    s.addText(String(i + 1), {
      x: x, y: y + 0.05, w: 0.35, h: 0.35,
      fontSize: 11, fontFace: "Arial", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0
    });
    s.addText(item, {
      x: x + 0.45, y: y, w: colW - 0.5, h: 0.45,
      fontSize: 13, fontFace: "Calibri",
      color: C.charcoal, align: "left", valign: "middle", margin: 0
    });
  });

  addFooter(pres, s, num, total);
}

// ─── Content Slide ───────────────────────────────────────────────
function buildContentSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  const layout = slide.layout || "bullets";

  if (layout === "bullets") {
    const items = slide.items || [];
    const textArr = items.map((item, i) => ({
      text: item,
      options: { bullet: true, breakLine: i < items.length - 1 }
    }));
    s.addText(textArr, {
      x: 0.5, y: 1.0, w: 9, h: 4.1,
      fontSize: 14, fontFace: "Calibri",
      color: C.charcoal, valign: "top", paraSpaceAfter: 8
    });
  }
  else if (layout === "bullets-bold") {
    // items: ["Title — Description", ...]
    const items = slide.items || [];
    const textArr = items.map((item, i) => {
      const [title, ...descParts] = String(item).split("—");
      return {
        text: item,
        options: {
          bullet: true,
          breakLine: i < items.length - 1,
          fontSize: 13, fontFace: "Calibri",
          color: C.charcoal,
          paraSpaceAfter: 6
        }
      };
    });
    s.addText(textArr, {
      x: 0.5, y: 1.0, w: 9, h: 4.1,
      fontSize: 13, fontFace: "Calibri",
      color: C.charcoal, valign: "top", paraSpaceAfter: 6
    });
  }
  else if (layout === "cards-2" || layout === "cards-3" || layout === "cards-4") {
    const cols = parseInt(layout.split("-")[1]);
    const cards = slide.cards || [];
    const totalW = 9;
    const gap = 0.3;
    const cardW = (totalW - gap * (cols - 1)) / cols;
    const cardH = slide.cardH || 2.2;
    const startX = 0.5;
    const startY = 1.0;

    cards.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + 0.2);
      const accentColor = card.color || C.coral;

      // Card background
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH,
        fill: { color: C.lightGray }
      });
      // Top accent bar
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: 0.05,
        fill: { color: accentColor }
      });
      // Card title
      if (card.title) {
        s.addText(card.title, {
          x: x + 0.15, y: y + 0.15, w: cardW - 0.3, h: 0.4,
          fontSize: 13, fontFace: "Arial", bold: true,
          color: accentColor, align: "left", valign: "top", margin: 0
        });
      }
      // Card body
      const bodyY = card.title ? y + 0.55 : y + 0.1;
      const bodyH = card.title ? cardH - 0.65 : cardH - 0.2;
      s.addText(card.text || "", {
        x: x + 0.15, y: bodyY, w: cardW - 0.3, h: bodyH,
        fontSize: 11, fontFace: "Calibri",
        color: C.charcoal, align: "left", valign: "top", margin: 0
      });
    });
  }
  else if (layout === "grid-2x2") {
    const cards = slide.cards || [];
    const cardW = 4.3;
    const cardH = 2.0;
    const gap = 0.4;
    const colors = [C.coral, C.purple, C.green, C.blue];

    cards.slice(0, 4).forEach((card, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.5 + col * (cardW + gap);
      const y = 1.0 + row * (cardH + 0.2);
      const color = card.color || colors[i % colors.length];

      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH, fill: { color: C.lightGray }
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: 0.05, fill: { color }
      });
      s.addText(card.title || "", {
        x: x + 0.15, y: y + 0.12, w: cardW - 0.3, h: 0.4,
        fontSize: 13, fontFace: "Arial", bold: true,
        color: color, align: "left", valign: "top", margin: 0
      });
      s.addText(card.text || "", {
        x: x + 0.15, y: y + 0.5, w: cardW - 0.3, h: cardH - 0.6,
        fontSize: 11, fontFace: "Calibri",
        color: C.charcoal, align: "left", valign: "top", margin: 0
      });
    });
  }
  else if (layout === "steps") {
    const steps = slide.steps || [];
    const stepH = 0.65;
    const gap = 0.15;

    steps.forEach((step, i) => {
      const y = 1.0 + i * (stepH + gap);
      const color = step.color || C.coral;

      s.addShape(pres.shapes.OVAL, {
        x: 0.5, y: y + 0.08, w: 0.45, h: 0.45,
        fill: { color }
      });
      s.addText(String(step.num || i + 1), {
        x: 0.5, y: y + 0.08, w: 0.45, h: 0.45,
        fontSize: 12, fontFace: "Arial", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });

      const titleText = step.title || "";
      const bodyText = step.text || "";
      const combined = titleText && bodyText
        ? `${titleText}：${bodyText}`
        : (titleText || bodyText);

      s.addText(combined, {
        x: 1.1, y: y, w: 8.4, h: stepH,
        fontSize: 13, fontFace: "Calibri",
        color: C.charcoal, align: "left", valign: "middle", margin: 0
      });

      if (i < steps.length - 1) {
        s.addText("↓", {
          x: 0.5, y: y + stepH - 0.02, w: 0.45, h: 0.3,
          fontSize: 14, color: C.darkGray, align: "center", valign: "middle", margin: 0
        });
      }
    });

    // Key insight box
    if (slide.insight) {
      const boxY = 1.0 + steps.length * (stepH + gap) + 0.1;
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: boxY, w: 9, h: 0.65,
        fill: { color: "FEF3C7" }
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: boxY, w: 0.06, h: 0.65, fill: { color: C.coral }
      });
      s.addText(slide.insight, {
        x: 0.7, y: boxY, w: 8.6, h: 0.65,
        fontSize: 12, fontFace: "Calibri",
        color: C.charcoal, align: "left", valign: "middle", margin: 0
      });
    }
  }

  addFooter(pres, s, num, total);
}

// ─── Flow Slide ──────────────────────────────────────────────────
function buildFlowSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  const steps = slide.steps || [];
  const stepW = Math.min(1.6, 9 / steps.length - 0.1);
  const gap = (9 - steps.length * stepW) / (steps.length - 1);
  const startX = 0.5;
  const y = 1.3;

  steps.forEach((step, i) => {
    const x = startX + i * (stepW + gap);
    const color = typeof step === "object" ? (step.color || C.coral) : C.coral;
    const label = typeof step === "object" ? step.label : step;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: stepW, h: 2.5, fill: { color: C.lightGray }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: stepW, h: 0.05, fill: { color }
    });

    if (typeof step === "object" && step.num) {
      s.addShape(pres.shapes.OVAL, {
        x: x + stepW / 2 - 0.2, y: y + 0.15, w: 0.4, h: 0.4,
        fill: { color }
      });
      s.addText(String(step.num), {
        x: x + stepW / 2 - 0.2, y: y + 0.15, w: 0.4, h: 0.4,
        fontSize: 11, fontFace: "Arial", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
    }

    s.addText(label, {
      x: x + 0.08, y: y + (step.num ? 0.65 : 0.15),
      w: stepW - 0.16, h: 1.7,
      fontSize: 11, fontFace: "Calibri",
      color: C.charcoal, align: "center", valign: "top", margin: 0
    });

    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + stepW + 0.02, y: y + 1.1, w: gap - 0.04, h: 0.3,
        fontSize: 16, color: C.darkGray, align: "center", valign: "middle", margin: 0
      });
    }
  });

  addFooter(pres, s, num, total);
}

// ─── Table Slide ─────────────────────────────────────────────────
function buildTableSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  const headers = slide.headers || [];
  const rows = slide.rows || [];

  const tableData = [
    headers.map(h => ({
      text: h,
      options: {
        fill: { color: C.charcoal }, color: C.white,
        bold: true, fontSize: 11, fontFace: "Calibri",
        align: "center", valign: "middle"
      }
    })),
    ...rows.map((row, ri) =>
      row.map((cell, ci) => ({
        text: String(cell),
        options: {
          fill: { color: (slide.highlightRows || []).includes(ri) ? "FEF2F2" : C.white },
          color: C.charcoal,
          fontSize: 11, fontFace: "Calibri",
          align: ci === 0 ? "left" : "center",
          valign: "middle",
          bold: (slide.highlightRows || []).includes(ri) && ci === 0
        }
      }))
    )
  ];

  const colCount = headers.length;
  const colWidths = slide.colWidths || computeColWidths(colCount, slide);

  s.addTable(tableData, {
    x: 0.5, y: 1.0, w: 9,
    colW: colWidths,
    border: { pt: 0.5, color: C.midGray },
    fontFace: "Calibri"
  });

  if (slide.tooltip) {
    s.addText(slide.tooltip, {
      x: 0.5, y: 4.8, w: 9, h: 0.5,
      fontSize: 10, fontFace: "Calibri",
      color: C.darkGray, align: "left", valign: "top", margin: 0
    });
  }

  addFooter(pres, s, num, total);
}

function computeColWidths(cols, slide) {
  if (cols === 6) return [2.2, 1.2, 1.1, 1.1, 1.5, 1.9];
  if (cols === 5) return [2.2, 1.2, 1.1, 1.1, 3.4];
  if (cols === 4) return [2.5, 1.2, 1.2, 4.1];
  if (cols === 3) return [3, 3, 3];
  return Array(cols).fill(9 / cols);
}

// ─── Bars Slide ──────────────────────────────────────────────────
function buildBarsSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  const items = slide.items || [];
  const barMaxW = 6.5;
  const barH = 0.55;
  const gap = 0.2;
  const labelW = 1.4;
  const startX = 2.0;
  const startY = 1.1;

  items.forEach((item, i) => {
    const y = startY + i * (barH + gap);
    const ratio = Math.min(item.value / (item.baseline || 100), 1);
    const barW = barMaxW * ratio;

    s.addText(item.label, {
      x: 0.5, y, w: labelW, h: barH,
      fontSize: 12, fontFace: "Calibri",
      color: C.charcoal, align: "right", valign: "middle", margin: 0
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: startX, y: y + 0.05, w: barMaxW, h: barH - 0.1,
      fill: { color: C.lightGray }
    });

    const fillColor = item.isBaseline ? C.coral : C.blue;
    s.addShape(pres.shapes.RECTANGLE, {
      x: startX, y: y + 0.05, w: barW, h: barH - 0.1,
      fill: { color: fillColor }
    });

    s.addText(`${item.value}%`, {
      x: startX + barW + 0.1, y, w: 0.8, h: barH,
      fontSize: 12, fontFace: "Arial", bold: true,
      color: fillColor, align: "left", valign: "middle", margin: 0
    });

    if (item.drop !== undefined && !item.isBaseline) {
      s.addText(`-${item.drop}%`, {
        x: startX + barMaxW + 0.05, y, w: 0.9, h: barH,
        fontSize: 11, fontFace: "Arial", bold: true,
        color: C.coral, align: "left", valign: "middle", margin: 0
      });
    }
  });

  if (slide.insight) {
    const boxY = startY + items.length * (barH + gap) + 0.15;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: boxY, w: 9, h: 0.6,
      fill: { color: "FEF3C7" }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: boxY, w: 0.06, h: 0.6, fill: { color: C.coral }
    });
    s.addText(slide.insight, {
      x: 0.7, y: boxY, w: 8.6, h: 0.6,
      fontSize: 12, fontFace: "Calibri",
      color: C.charcoal, align: "left", valign: "middle", margin: 0
    });
  }

  addFooter(pres, s, num, total);
}

// ─── Stats Slide ─────────────────────────────────────────────────
function buildStatsSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  const cards = slide.cards || [];
  const cols = cards.length;
  const totalW = 9;
  const gap = 0.35;
  const cardW = (totalW - gap * (cols - 1)) / cols;
  const startX = 0.5;
  const startY = 1.1;
  const cardH = 2.3;

  cards.forEach((card, i) => {
    const x = startX + i * (cardW + gap);
    const color = card.color || C.coral;
    const bgColor = card.bgColor || C.lightGray;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y: startY, w: cardW, h: cardH, fill: { color: bgColor }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: startY, w: cardW, h: 0.06, fill: { color }
    });
    s.addText(card.value || "", {
      x, y: startY + 0.25, w: cardW, h: 1.0,
      fontSize: card.big ? 42 : 36, fontFace: "Arial", bold: true,
      color, align: "center", valign: "middle", margin: 0
    });
    s.addText(card.label || "", {
      x: x + 0.1, y: startY + 1.3, w: cardW - 0.2, h: 0.9,
      fontSize: 11, fontFace: "Calibri",
      color: C.charcoal, align: "center", valign: "top", margin: 0
    });
  });

  addFooter(pres, s, num, total);
}

// ─── Formula Slide ────────────────────────────────────────────────
function buildFormulaSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  // Formula box
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 9, h: 1.2,
    fill: { color: C.lightGray }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 0.06, h: 1.2, fill: { color: C.coral }
  });
  s.addText(slide.formula || "", {
    x: 0.7, y: 1.0, w: 8.6, h: 1.2,
    fontSize: 14, fontFace: "JetBrains Mono",
    color: C.charcoal, align: "left", valign: "middle", margin: 0
  });

  // Explanation lines
  const lines = slide.explanation || [];
  lines.forEach((line, i) => {
    const y = 2.4 + i * 0.55;
    s.addText(line.symbol || "", {
      x: 0.5, y, w: 1.5, h: 0.5,
      fontSize: 11, fontFace: "Arial", bold: true,
      color: C.coral, align: "left", valign: "top", margin: 0
    });
    s.addText(line.desc || "", {
      x: 2.1, y, w: 7.4, h: 0.5,
      fontSize: 12, fontFace: "Calibri",
      color: C.charcoal, align: "left", valign: "top", margin: 0
    });
  });

  addFooter(pres, s, num, total);
}

// ─── Quote / Key Insight Slide ───────────────────────────────────
function buildQuoteSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 9, h: 2.5,
    fill: { color: "FEF2F2" }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 0.08, h: 2.5, fill: { color: C.coral }
  });
  s.addText(slide.text || "", {
    x: 0.75, y: 1.1, w: 8.5, h: 2.3,
    fontSize: 16, fontFace: "Calibri", italic: true,
    color: C.charcoal, align: "left", valign: "top", margin: 0
  });

  if (slide.lines) {
    slide.lines.forEach((line, i) => {
      const y = 3.7 + i * 0.65;
      s.addText(line.symbol || "", {
        x: 0.5, y, w: 2.0, h: 0.55,
        fontSize: 12, fontFace: "Arial", bold: true,
        color: C.coral, align: "left", valign: "top", margin: 0
      });
      s.addText(line.desc || "", {
        x: 2.5, y, w: 7.0, h: 0.55,
        fontSize: 12, fontFace: "Calibri",
        color: C.charcoal, align: "left", valign: "top", margin: 0
      });
    });
  }

  addFooter(pres, s, num, total);
}

// ─── Summary Slide ───────────────────────────────────────────────
function buildSummarySlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  const items = slide.items || [];
  const cols = Math.min(items.length, 2);
  const colW = 4.3;
  const gap = 0.4;
  const startX = 0.5;
  const rowH = 0.85;
  const gapY = 0.15;

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (colW + gap);
    const y = 1.0 + row * (rowH + gapY);

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: colW, h: rowH, fill: { color: C.lightGray }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: colW, h: 0.05, fill: { color: C.coral }
    });
    s.addText(`${item.tag || "•"} ${item.label || ""}`, {
      x: x + 0.12, y: y + 0.1, w: colW - 0.24, h: 0.35,
      fontSize: 12, fontFace: "Arial", bold: true,
      color: C.coral, align: "left", valign: "top", margin: 0
    });
    s.addText(item.text || "", {
      x: x + 0.12, y: y + 0.4, w: colW - 0.24, h: rowH - 0.45,
      fontSize: 10, fontFace: "Calibri",
      color: C.charcoal, align: "left", valign: "top", margin: 0
    });
  });

  addFooter(pres, s, num, total);
}

// ─── Timeline Slide ──────────────────────────────────────────────
function buildTimelineSlide(pres, slide, num, total) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(pres, s,slide.title || "", num, total);

  const items = slide.items || [];
  const itemH = 0.78;
  const startY = 1.0;

  // Vertical line
  s.addShape(pres.shapes.LINE, {
    x: 1.3, y: startY + 0.2, w: 0, h: items.length * itemH - 0.1,
    line: { color: C.midGray, width: 2 }
  });

  items.forEach((item, i) => {
    const y = startY + i * itemH;

    s.addShape(pres.shapes.OVAL, {
      x: 1.15, y: y + 0.1, w: 0.3, h: 0.3,
      fill: { color: item.color || C.coral }
    });

    s.addText(item.year || "", {
      x: 0.3, y, w: 0.8, h: 0.5,
      fontSize: 10, fontFace: "Arial", bold: true,
      color: C.darkGray, align: "right", valign: "top", margin: 0
    });

    s.addText(item.title || "", {
      x: 1.6, y, w: 3.0, h: 0.5,
      fontSize: 12, fontFace: "Arial", bold: true,
      color: C.charcoal, align: "left", valign: "top", margin: 0
    });

    s.addText(item.desc || "", {
      x: 4.7, y, w: 4.8, h: 0.65,
      fontSize: 10, fontFace: "Calibri",
      color: C.darkGray, align: "left", valign: "top", margin: 0
    });
  });

  addFooter(pres, s, num, total);
}

// ─── TOC Slide ───────────────────────────────────────────────────
function buildTocSlide(pres, slide, num, total) {
  buildOutlineSlide(pres, slide, num, total);
}

// ─── Shared UI Helpers ───────────────────────────────────────────
function addHeader(pres, slide, title, num, total) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.7, fill: { color: C.charcoal }
  });
  slide.addText(title, {
    x: 0.5, y: 0, w: 9, h: 0.7,
    fontSize: 20, fontFace: "Arial", bold: true,
    color: C.white, align: "left", valign: "middle", margin: 0
  });
  slide.addText(String(num), {
    x: 9.3, y: 0, w: 0.5, h: 0.7,
    fontSize: 14, fontFace: "Calibri",
    color: C.coral, align: "right", valign: "middle", margin: 0
  });
}

function addFooter(pres, slide, num, total) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.35, w: 10, h: 0.28, fill: { color: C.lightGray }
  });
  slide.addText(`${num} / ${total}`, {
    x: 9.0, y: 5.35, w: 0.8, h: 0.28,
    fontSize: 9, fontFace: "Calibri",
    color: C.darkGray, align: "right", valign: "middle", margin: 0
  });
}

// ─── CLI Entry Point ─────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  let outputPath = "presentation.pptx";
  let configPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--config" && args[i + 1]) {
      configPath = args[i + 1];
      i++;
    } else if (!args[i].startsWith("--")) {
      outputPath = args[i];
    }
  }

  // Load config from JSON file or use inline
  let config;
  if (configPath && fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else if (fs.existsSync("slides-config.json")) {
    config = JSON.parse(fs.readFileSync("slides-config.json", "utf8"));
  } else {
    console.error("❌ No config found. Usage: node generate-pptx.js output.pptx --config slides.json");
    process.exit(1);
  }

  generatePPTX(config, outputPath);
}

module.exports = { generatePPTX };
