# paper-to-course

### Turn any research paper into an interactive HTML course + Markdown + PPTX

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-7C3AED?style=flat-square)](https://claude.ai/code)
[![English README](https://img.shields.io/badge/README-English-blue?style=flat-square)](README.md)
[![中文说明](https://img.shields.io/badge/中文说明-DD94F30?style=flat-square)](README_zh.md)

**paper-to-course** is a [Claude Code](https://claude.ai/code) skill that transforms any academic paper into:

- A **scrollable HTML course** — interactive, self-contained, works offline
- A **Markdown document** — readable text version with code/formulas preserved
- A **PPTX presentation** — clean 16-slide deck, generic for all engineering papers

> **Live demo:** [`examples/deepseek-r1-zh/`](examples/deepseek-r1-zh/) — DeepSeek-R1 (Nature 2025) Chinese course (HTML + PPTX).

---

## ✨ Features

- **7 interactive HTML elements** — formula breakdowns, literature timelines, comparison tables, ablation diagrams, method chat animations, comprehension quizzes, glossary tooltips
- **6-module curriculum** — Problem → Timeline → SOTA → Method → Experiments → Limitations
- **Generic PPTX generator** — paper-agnostic slide config system, works for any engineering/research paper
- **Markdown export** — code blocks, LaTeX formulas, tables all preserved
- **Single HTML output** — self-contained, zero dependencies, works offline
- **Warm design** — off-white + coral aesthetic, distinctive typography

---

## 🚀 Quick Start

### Method 1: `npx skills add` (Recommended)

```bash
npx skills add KaguraTart/paper-to-course
```

### Method 2: Copy manually

```bash
git clone https://github.com/KaguraTart/paper-to-course.git
cp -r paper-to-course ~/.claude/skills/
```

### Method 3: Claude Code plugin marketplace

```bash
/plugin marketplace add anthropics/skills
/plugin install paper-to-course
```

### Use it

```
Turn this paper into a course
```

---

## 📂 Project Structure

```
paper-to-course/
├── SKILL.md                    # Claude Code skill instructions
├── README.md / README_zh.md    # This file (bilingual)
├── examples/                  # Example courses (source + generated outputs)
│   └── deepseek-r1-zh/       # DeepSeek-R1 demo
│       ├── modules/           # HTML module source files
│       ├── slides-config.json # Generic slide config (JSON)
│       ├── index.html         # Generated HTML course
│       ├── presentation.pptx  # Generated PPTX
│       └── screenshots/       # Module screenshots (auto-generated)
├── scripts/
│   ├── build-all.js           # Unified pipeline: HTML + MD + PPTX + screenshots
│   ├── generate-pptx.js      # Generic PPTX generator (paper-agnostic)
│   └── html-to-md.js          # HTML → Markdown converter
└── references/                 # Design system
    ├── styles.css             # Complete design system
    ├── main.js                # Interactive engine
    ├── _base.html             # HTML template
    ├── _footer.html           # HTML footer
    └── paper-elements.md      # 7 element implementation patterns
```

---

## 📦 Unified Build Pipeline

```bash
# Build a specific paper (source in examples/, output in examples/<name>/)
node scripts/build-all.js deepseek-r1-zh --zh

# Build English version
node scripts/build-all.js deepseek-r1 --en

# Build both
node scripts/build-all.js deepseek-r1-zh

# PPTX only (after HTML built)
node scripts/build-all.js deepseek-r1-zh --slides-only
```

**Prerequisites:**
```bash
npm install -g pptxgenjs puppeteer-core
# Chrome/Chromium must be in PATH (set CHROME_BIN env var if needed)
```

---

## 🖨️ Generic PPTX Generator

The `generate-pptx.js` is **completely paper-agnostic** — supply a JSON config and it generates slides. Works for any engineering/research paper.

```bash
node scripts/generate-pptx.js output.pptx --config slides-config.json
```

### Supported slide types

| Type | Description |
|------|-------------|
| `outline` | Numbered list (2 columns) |
| `content` | bullets / cards-2/3/4 / grid-2x2 / steps |
| `flow` | Horizontal pipeline with numbered boxes |
| `table` | Multi-column comparison table |
| `bars` | Horizontal bar chart |
| `stats` | Big number stat cards |
| `formula` | Math formula with line-by-line explanation |
| `quote` | Key insight / quote box |
| `timeline` | Vertical timeline (year → title → description) |
| `summary` | Tag + title + description cards (2 columns) |

### Slide config example

```json
{
  "title": "Paper Title",
  "subtitle": "Subtitle",
  "slides": [
    { "type": "outline", "items": ["Section 1", "Section 2"] },
    { "type": "content", "title": "Background", "layout": "cards-3",
      "cards": [
        { "title": "Topic A", "text": "Description", "color": "#D94F30" },
        { "title": "Topic B", "text": "Description", "color": "#7C3AED" }
      ]
    },
    { "type": "table", "title": "Results",
      "headers": ["Model", "Score"],
      "rows": [["A", "90%"], ["B", "85%"]]
    },
    { "type": "bars", "title": "Ablation",
      "items": [
        { "label": "Full", "value": 90, "baseline": 100, "isBaseline": true },
        { "label": "w/o X", "value": 75, "drop": 15 }
      ]
    }
  ]
}
```

---

## 🔌 Extending with CLI Tools

```bash
# Install Codex
npx skills add openai/codex

# Install skill-publisher (auto GitHub publishing)
npx skills add joeseesun/skill-publisher

# Install from any GitHub repo
npx skills add <owner>/<repo>
```

### openclaw Integration

```bash
# Install openclaw
curl -fsSL https://openclaw.ai/install.sh | bash
openclaw onboard

# Method A: Copy to openclaw skills directory
cp -r paper-to-course ~/.openclaw/skills/

# Method B: Via openclaw Web IDE
# Settings → Skills → Add Skill → point to SKILL.md
```

### Claude Code Plugin Marketplaces

| Marketplace | Command |
|------------|---------|
| Anthropic official | `/plugin marketplace add anthropics/skills` then `/plugin install <skill>` |
| Community | `/plugin marketplace add jamesrochabrun/skills` |
| Focus.AI | `/plugin marketplace add the-focus-ai/claude-marketplace` |

---

## 🌍 Publishing to Skills Platforms

### Option A: GitHub (Recommended)

1. Create a public GitHub repository with a valid `SKILL.md` (with YAML frontmatter)
2. Write clear documentation in `SKILL.md` and `README.md`
3. (Optional) Use `skill-publisher` to automate:
   ```bash
   npx skills add joeseesun/skill-publisher
   # Then: "Publish my skill to GitHub"
   ```
4. Users install via `npx skills add <owner>/<repo>`

### Option B: Plugin Marketplace Submission

- **Anthropic skills:** PR to `github.com/anthropics/skills`
- **Community marketplaces:** PR to their respective repos

### Option C: openclaw Skills Platform

1. Publish to GitHub
2. Submit to [openclaw skills registry](https://openclaw.ai/skills)
3. Or: openclaw onboard wizard → Skills → Add from GitHub

### Option D: OpenCode Skills

```bash
# Check if OpenCode supports the same npx skills add command
# or look for /plugin marketplace add opencode/<repo>
```

---

## 🎓 Use Cases

| Who | How it helps |
|-----|-------------|
| **ML/AI Researchers** | Rapidly understand a new paper's contributions |
| **PhD Students** | Structured, interactive walkthrough of a subfield |
| **Research Teams** | Create onboarding materials for new lab members |
| **Educators** | Turn papers into teaching materials with built-in quizzes |

---

## 🔧 Customization

```css
/* Override the accent color */
:root { --color-accent: #7C3AED; }
```

See `references/paper-elements.md` for all available HTML patterns.

---

## 📋 Requirements

- [Claude Code](https://claude.ai/code) — any plan
- Node.js (for PPTX generation)
- Chrome/Chromium (for screenshots)

---

## 📜 License

MIT — free to use, modify, and distribute. Attribution appreciated.
