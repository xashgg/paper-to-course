# paper-to-course

### Turn any research paper into an interactive, self-contained HTML course

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-7C3AED?style=flat-square)](https://claude.ai/code)

**paper-to-course** is a [Claude Code](https://claude.ai/code) skill that transforms any academic paper into a beautiful, scrollable HTML course — no server, no dependencies, works entirely offline in your browser.

It parses the paper structure, designs a 6-module curriculum, and generates interactive elements: formula breakdowns, literature timelines, comparison tables, ablation diagrams, method chat animations, comprehension quizzes, and glossary tooltips.

> **Live demo (HTML):** See it in action → [`deepseek-r1-test/`](deepseek-r1-test/) — a complete course on DeepSeek-R1 (Nature 2025).
>
> **Live demo (PPTX + PDF):** [`deepseek-r1-presentation.pptx`](deepseek-r1-presentation.pptx) and [`deepseek-r1-presentation.pdf`](deepseek-r1-presentation.pdf) — a 16-slide group meeting presentation in clean white style.

---

## ✨ Features

- **7 interactive element types** — each designed for paper-specific teaching goals

| Element | What it does |
|---------|-------------|
| **Formula Breakdown** | Math formulas translated line-by-line into plain English |
| **Literature Timeline** | Animated history of the field's key milestones |
| **Comparison Table** | Hover to see detailed trade-off analysis between methods |
| **Ablation Diagram** | Visual ablation study showing each component's contribution |
| **Method Chat** | Animated component conversations explaining how the method works |
| **Comprehension Quiz** | Multiple-choice questions to test your understanding |
| **Glossary Tooltips** | Hover any technical term for a plain-English definition |

- **6-module curriculum** — consistent structure across every paper:
  1. Problem & Motivation
  2. Literature Timeline
  3. State-of-the-Art Comparison
  4. Method Deep-Dive
  5. Experiments & Results
  6. Limitations & Future Work

- **Single HTML output** — self-contained, zero dependencies, works offline
- **Warm design** — off-white + coral aesthetic, distinctive typography
- **Mobile-friendly** — scroll-based navigation, responsive layout

---

## 🚀 Quick Start

### 1. Install (30 seconds)

```bash
# Copy the skill to your Claude Code skills directory
cp -r paper-to-course ~/.claude/skills/
```

### 2. Use it

Open any project in Claude Code, then say:

```
Turn this paper into a course
```

Point it at a PDF or LaTeX source — it handles the rest.

### 3. Open

```bash
open index.html   # macOS
xdg-open index.html   # Linux
```

---

## 📂 File Structure

```
paper-to-course/
├── SKILL.md                    # Claude Code skill instructions
├── README.md                   # This file
├── LICENSE                     # MIT License
├── deepseek-r1-test/          # Live demo: DeepSeek-R1 HTML course (EN)
│   ├── index.html             # Open in browser
│   └── modules/               # Source modules
├── deepseek-r1-test-zh/       # Live demo: DeepSeek-R1 HTML course (中文)
├── deepseek-r1-presentation.pptx  # Live demo: PPTX (16 slides)
├── deepseek-r1-presentation.pdf   # Live demo: PDF
├── scripts/
│   └── generate-pptx.js     # PPTX generator script
└── references/
    ├── styles.css            # Complete design system
    ├── main.js               # Interactive engine
    ├── build.sh              # HTML bundler
    ├── _base.html            # HTML template
    ├── _footer.html          # HTML footer
    └── paper-elements.md     # 7 element implementation patterns
```

---

## 🎓 Use Cases

| Who | How it helps |
|-----|-------------|
| **ML/AI Researchers** | Rapidly understand a new paper's contributions without reading the whole thing |
| **PhD Students** | Learn a new subfield through a structured, interactive walkthrough |
| **Research Teams** | Create onboarding materials for new lab members |
| **Tech Leads** | Evaluate if a paper's method fits their production needs |
| **Educators** | Turn papers into teaching materials with built-in quizzes |

---

## 🆚 What makes this different?

Unlike generic paper summaries, paper-to-course:

- **Generates the course** — not just a summary. You get structured modules, not bullet points.
- **Explains formulas** — every equation is broken down line-by-line in plain English
- **Visualizes the evolution** — literature timelines show *how* the field developed
- **Compares methods** — not just listing them, but showing trade-offs interactively
- **Lets you test yourself** — built-in quizzes verify actual understanding

---

## 🖥️ Group Meeting Presentations (PPTX + PDF)

Generate a clean, minimal PPTX for paper presentations:

```bash
# Install dependency
npm install -g pptxgenjs

# Generate PPTX
node scripts/generate-pptx.js paper-presentation.pptx

# Convert to PDF
libreoffice --headless --convert-to pdf paper-presentation.pptx --outdir .
```

Design: white background, charcoal headers, coral accents, Arial Black + Calibri fonts. 16 slides covering problem → timeline → method → experiments → conclusion.

**Style:** Minimal and clean — white background throughout. Designed for academic group meetings where clarity beats decoration.



The skill reads the paper (PDF or LaTeX), then:

1. **Analyze** — extract structure: Abstract → Related Work → Method → Experiments → Conclusion
2. **Design** — create a 6-module curriculum tailored to this paper's content
3. **Generate** — write HTML modules using the reference design system
4. **Bundle** — run `build.sh` to produce a single `index.html`

You get a file you can open in any browser, share via email, or host on any static server.

---

## 🔧 Customization

All CSS and JS are in `references/` — copy them into your course directory and customize:

```css
/* Override the accent color */
:root { --color-accent: #7C3AED; }
```

```javascript
// The engine auto-initializes on DOMContentLoaded
// No configuration needed — class names drive everything
```

See `references/paper-elements.md` for all available HTML patterns.

---

## 📋 Requirements

- [Claude Code](https://claude.ai/code) — any plan
- A paper in PDF or LaTeX format

---

## 📜 License

MIT — free to use, modify, and distribute. Attribution appreciated.
