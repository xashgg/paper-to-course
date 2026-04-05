#!/usr/bin/env node
/**
 * paper-to-course — HTML to Markdown Converter
 *
 * Converts a combined HTML course into a readable Markdown document.
 * Preserves code blocks, formulas, tables, and structured content.
 *
 * Usage:
 *   node html-to-md.js <input.html> [output.md]
 *
 * Or from build-all.js:
 *   const { htmlToMarkdown } = require('./html-to-md.js');
 */

const fs = require("fs");
const path = require("path");

// ─── HTML → Markdown Core ─────────────────────────────────────────
function htmlToMarkdown(html, options = {}) {
  let md = "";

  // Extract title from <title> tag
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    md += `# ${titleMatch[1].trim()}\n\n`;
  }

  // Remove scripts, styles, nav
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Convert sections
  text = convertModules(text, options);

  md += text;
  return md;
}

function convertModules(html, opts) {
  let out = "";

  // Split by module divs
  const moduleBlocks = html.split(/(?=<div class="module")/gi);

  for (const block of moduleBlocks) {
    if (!block.trim()) continue;
    out += convertBlock(block, opts);
  }

  return out;
}

function convertBlock(html, opts) {
  let out = "";

  // Module header
  const moduleNum = extract(html, /<span class="module-number">(.*?)<\/span>/i);
  const moduleTitle = extract(html, /<h2 class="module-title">(.*?)<\/h2>/i);
  const moduleSubtitle = extract(html, /<p class="module-subtitle">(.*?)<\/p>/i);

  if (moduleTitle) {
    out += `\n## ${moduleNum ? moduleNum + ". " : ""}${stripTags(moduleTitle)}\n`;
    if (moduleSubtitle) {
      out += `*${stripTags(moduleSubtitle)}*\n`;
    }
  }

  // Regular headings
  html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, t) => {
    return `\n### ${stripTags(t)}\n`;
  });

  // Paragraphs
  html = html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => {
    const cleaned = stripTags(content).trim();
    if (!cleaned) return "";
    return cleaned + "\n\n";
  });

  // Code blocks
  html = html.replace(/<pre><code(?: class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/gi, (_, lang, code) => {
    const language = lang || "text";
    return `\n\`\`\`${language}\n${decodeHtmlEntities(code.trim())}\n\`\`\`\n`;
  });

  // Inline code
  html = html.replace(/<code>([\s\S]*?)<\/code>/gi, (_, code) => {
    return `\`${decodeHtmlEntities(code)}\``;
  });

  // Formulas (math blocks)
  html = html.replace(/<span class="formula-math">([\s\S]*?)<\/span>/gi, (_, formula) => {
    return `\n$$\n${stripTags(formula).trim()}\n$$\n`;
  });

  html = html.replace(/<div class="formula-math">([\s\S]*?)<\/div>/gi, (_, formula) => {
    return `\n$$\n${stripTags(formula).trim()}\n$$\n`;
  });

  // Formula symbols in formula-line
  html = html.replace(/<span class="formula-symbol">([\s\S]*?)<\/span>/gi, (_, sym) => {
    return `**${stripTags(sym)}**: `;
  });

  // Formula explanations
  html = html.replace(/<span class="formula-english">([\s\S]*?)<\/span>/gi, (_, exp) => {
    return `${stripTags(exp)}  \n`;
  });

  // Formula lines
  html = html.replace(/<div class="formula-line">([\s\S]*?)<\/div>/gi, (_, line) => {
    return `${stripTags(line)}\n`;
  });

  // Tables
  html = html.replace(/<table[\s\S]*?>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    return convertTable(tableContent);
  });

  // Step cards
  html = html.replace(/<div class="step-card">([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div class="step-card"|<\/div>\s*<h3|\s*<!--|$)/gi, (_, card) => {
    return convertStepCard(card);
  });

  // Step cards (simpler pattern for adjacent cards)
  html = html.replace(/<div class="step-card">([\s\S]*?)<\/div>\s*(?=<!-- |<\/div>\s*$)/gi, (_, card) => {
    return convertStepCard(card);
  });

  // Icon rows
  html = html.replace(/<div class="icon-row">([\s\S]*?)<\/div>\s*(?=<\/div>\s*(?:<div class="icon-row"|<h3|$))/gi, (_, row) => {
    return convertIconRow(row);
  });

  // Quiz
  html = html.replace(/<div class="quiz-container"[\s\S]*?<\/div>\s*<\/div>\s*(?=<!-- |<\/div>\s*$)/gi, (_, quiz) => {
    return convertQuiz(quiz);
  });

  // Badge items
  html = html.replace(/<div class="badge-item">([\s\S]*?)<\/div>\s*(?=<!-- |<\/div>\s*$)/gi, (_, item) => {
    return convertBadgeItem(item);
  });

  // Flow steps
  html = html.replace(/<div class="flow-step">([\s\S]*?)<\/div>\s*(?=<\/div>\s*<div class="flow-step"|$)/gi, (_, step) => {
    return convertFlowStep(step);
  });

  // Flow arrows
  html = html.replace(/<div class="flow-arrow">([\s\S]*?)<\/div>/gi, (_, arrow) => {
    return ` → `;
  });

  // Timeline items
  html = html.replace(/<div class="timeline-item"[^>]*>([\s\S]*?)<\/div>\s*(?=<!-- |$)/gi, (_, item) => {
    return convertTimelineItem(item);
  });

  // Comparison table container
  html = html.replace(/<div class="comparison-table-container"[\s\S]*?>([\s\S]*?)<\/div>\s*<\/div>/gi, (_, content) => {
    return convertComparisonTable(content);
  });

  // Formula blocks
  html = html.replace(/<div class="formula-block"[\s\S]*?>([\s\S]*?)<\/div>\s*<\/div>/gi, (_, content) => {
    return convertFormulaBlock(content);
  });

  // Ablation container
  html = html.replace(/<div class="ablation-container"[\s\S]*?>([\s\S]*?)<\/div>\s*<\/div>/gi, (_, content) => {
    return convertAblationContainer(content);
  });

  // Remove remaining divs and spans
  html = html.replace(/<div[^>]*>/gi, "");
  html = html.replace(/<\/div>/gi, "\n");
  html = html.replace(/<span[^>]*>/gi, "");
  html = html.replace(/<\/span>/gi, "");
  html = html.replace(/<br\s*\/?>/gi, "\n");
  html = html.replace(/<hr\s*\/?>/gi, "\n---\n");

  // Clean up
  html = stripTags(html);

  // Remove excessive newlines
  html = html.replace(/\n{4,}/g, "\n\n\n");

  out += html;
  return out;
}

function convertTable(tableContent) {
  let md = "\n";

  // Extract rows
  const rows = tableContent.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  let colCount = 0;

  rows.forEach((row, ri) => {
    const cells = row.match(/<t[hd][\s\S]*?<\/t[hd]>/gi) || [];
    colCount = Math.max(colCount, cells.length);

    const cellText = cells.map(c => {
      const isBold = c.includes("<th");
      let text = stripTags(c).trim();
      if (isBold) text = `**${text}**`;
      return text;
    });

    if (ri === 0) {
      md += `| ${cellText.join(" | ")} |\n`;
      md += `| ${cellText.map(() => "---").join(" | ")} |\n`;
    } else {
      md += `| ${cellText.join(" | ")} |\n`;
    }
  });

  return md + "\n";
}

function convertComparisonTable(content) {
  return convertTable(content);
}

function convertStepCard(html) {
  const num = extract(html, /<div class="step-num">(.*?)<\/div>/);
  const strong = extract(html, /<strong>(.*?)<\/strong>/);
  const body = extract(html, /<div class="step-body">(.*?)<\/div>/s);
  const bodyText = stripTags(body || "").trim();
  const paragraphs = bodyText.split(/\n/).filter(l => l.trim());

  let out = "";
  if (strong) out += `**${stripTags(strong)}**\n`;
  out += paragraphs.join("\n") + "\n\n";
  return out;
}

function convertIconRow(html) {
  const title = extract(html, /<strong>(.*?)<\/strong>/);
  const body = extract(html, /<p[^>]*>([\s\S]*?)<\/p>/);
  let out = "";
  if (title) out += `### ${stripTags(title)}\n`;
  if (body) out += `${stripTags(body).trim()}\n\n`;
  return out;
}

function convertQuiz(html) {
  const question = extract(html, /<p><strong>Q:<\/strong>(.*?)<\/p>/);
  let out = "\n**Quiz**\n\n";
  if (question) out += `**Q:** ${stripTags(question).trim()}\n\n`;

  const options = html.match(/quiz-option[^>]*data-correct="(true|false)"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi) || [];
  options.forEach((opt, i) => {
    const letter = String.fromCharCode(65 + i);
    const isCorrect = opt.includes('data-correct="true"');
    const text = stripTags(opt.replace(/<span class="quiz-feedback[^<]*<\/span>/gi, "")).trim();
    out += `- [${letter}] ${text}${isCorrect ? " ✅" : ""}\n`;
  });

  return out + "\n";
}

function convertBadgeItem(html) {
  const tag = extract(html, /<span class="badge-code">(.*?)<\/span>/);
  const desc = extract(html, /<span class="badge-desc">(.*?)<\/span>/);
  let out = `- **${stripTags(tag || "")}**: ${stripTags(desc || "").trim()}\n`;
  return out;
}

function convertFlowStep(html) {
  const num = extract(html, /<div class="flow-step-num">(.*?)<\/div>/);
  const p = extract(html, /<p[^>]*>([\s\S]*?)<\/p>/);
  const lines = (stripTags(p || "")).split("\n").filter(l => l.trim());
  return `**${num}.** ${lines.join(" ")}\n`;
}

function convertTimelineItem(html) {
  const year = extract(html, /<span class="timeline-year">(.*?)<\/span>/);
  const title = extract(html, /<h4>(.*?)<\/h4>/);
  const desc = extract(html, /<p class="timeline-desc">(.*?)<\/p>/);
  const tag = extract(html, /<div class="timeline-method-tag">(.*?)<\/div>/);

  let out = `\n> **${year}** — ${stripTags(title || "")}`;
  if (tag) out += ` \`${stripTags(tag)}\``;
  out += "\n";
  if (desc) out += `> ${stripTags(desc).trim()}\n`;
  return out;
}

function convertFormulaBlock(content) {
  let out = "\n";
  const math = extract(content, /<div class="formula-math">([\s\S]*?)<\/div>/);
  const orig = extract(content, /<div class="formula-original">([\s\S]*?)<\/div>/s);
  if (math) {
    out += `$$\n${stripTags(math).trim()}\n$$\n`;
  }
  if (orig && !math) {
    out += `$$\n${stripTags(orig).trim()}\n$$\n`;
  }
  return out;
}

function convertAblationContainer(content) {
  let out = "\n";
  const bars = content.match(/<div class="ablation-bar-group">[\s\S]*?<\/div>\s*<\/div>/gi) || [];
  bars.forEach(bar => {
    const label = extract(bar, /<span class="ablation-label">(.*?)<\/span>/);
    const value = extract(bar, /<span class="ablation-value">(.*?)<\/span>/);
    if (label && value) {
      out += `- **${stripTags(label)}**: ${stripTags(value)}\n`;
    }
  });

  const insight = extract(content, /<span class="insight-icon">.*?<\/span>\s*<span>([\s\S]*?)<\/span>/);
  if (insight) out += `\n> ${stripTags(insight).trim()}\n`;
  return out + "\n";
}

// ─── Utilities ───────────────────────────────────────────────────
function extract(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : null;
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, (m) => {
      // Keep line breaks for block elements
      if (/^<\/(div|p|li|tr|td|th|h[1-6]|blockquote)$/i.test(m)) return "\n";
      if (/^<(div|p|li|td|th|h[1-6]|blockquote)[^>]*>$/i.test(m)) return "\n";
      return "";
    })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// ─── CLI Entry Point ─────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1] || (inputPath ? inputPath.replace(/\.html$/, ".md") : "output.md");

  if (!inputPath) {
    console.error("Usage: node html-to-md.js <input.html> [output.md]");
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, "utf8");
  const md = htmlToMarkdown(html);
  fs.writeFileSync(outputPath, md, "utf8");
  console.log(`✅ Markdown saved: ${outputPath}`);
}

module.exports = { htmlToMarkdown };
