# paper-to-course

### Turn any research paper into an interactive, self-contained HTML course — plus PPTX & PDF

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-7C3AED?style=flat-square)](https://claude.ai/code)

**paper-to-course** is a [Claude Code](https://claude.ai/code) skill that transforms any academic paper into:

- A **scrollable HTML course** — interactive, self-contained, works offline
- A **PPTX presentation** — 16-slide clean deck with embedded visuals
- A **PDF** — generated from the HTML for sharing

> **Live demo:** [`papers/deepseek-r1-zh/`](papers/deepseek-r1-zh/) — DeepSeek-R1 (Nature 2025) course in Chinese, with HTML, PDF, and PPTX all in one folder.

---

## ✨ Features

- **7 interactive element types** — formula breakdowns, literature timelines, comparison tables, ablation diagrams, method chat animations, comprehension quizzes, glossary tooltips
- **6-module curriculum** — Problem → Timeline → SOTA → Method → Experiments → Limitations
- **Single HTML output** — self-contained, zero dependencies, works offline
- **PPTX + PDF** — generated from the same content, all outputs in one folder
- **Warm design** — off-white + coral aesthetic, distinctive typography
- **Mobile-friendly** — scroll-based navigation, responsive layout

---

## 🚀 Quick Start

### Method 1: `npx skills add` (Recommended)

```bash
npx skills add KaguraTart/paper-to-course
```

This installs the skill directly from GitHub. Works for any GitHub repository with a valid `SKILL.md`.

### Method 2: Copy manually

```bash
git clone https://github.com/KaguraTart/paper-to-course.git
cp -r paper-to-course ~/.claude/skills/
```

### Method 3: Claude Code built-in plugin marketplace

```bash
# Add the Anthropic skills marketplace
/plugin marketplace add anthropics/skills

# Or add a community marketplace
/plugin marketplace add jamesrochabrun/skills

# Then install
/plugin install paper-to-course
```

> **Note:** Plugin marketplace support depends on your Claude Code version. Run `claude --version` to check.

### Use it

In any Claude Code project, point the skill at a paper PDF:

```
Turn this paper into a course
```

It handles the rest — generating HTML, PDF, and PPTX all in one `papers/<name>/` folder.

---

## 📂 File Structure

```
paper-to-course/
├── SKILL.md                    # Claude Code skill instructions
├── README.md                   # English (this file)
├── README_zh.md               # 中文说明
├── LICENSE                     # MIT License
├── papers/                    # Generated outputs
│   └── deepseek-r1-zh/       # Example: all outputs in one folder
│       ├── index.html         # Interactive HTML course
│       ├── *.pdf              # PDF export
│       ├── presentation.pptx  # 16-slide PPTX
│       ├── screenshots/       # Per-module PNG screenshots
│       └── generate-pptx.js  # Reusable PPTX generator
├── scripts/
│   ├── build-all.js           # Unified pipeline: HTML + PDF + PPTX + screenshots
│   └── generate-pptx.js       # PPTX generator (standalone)
└── references/
    ├── styles.css              # Complete design system
    ├── main.js                 # Interactive engine
    ├── build.sh               # HTML bundler (legacy)
    ├── _base.html             # HTML template
    ├── _footer.html           # HTML footer
    └── paper-elements.md      # 7 element implementation patterns
```

---

## 📦 Unified Build Pipeline

Generate all outputs (HTML + PDF + PPTX + screenshots) in one command:

```bash
# Build a specific paper
node scripts/build-all.js deepseek-r1-zh --zh

# Build English version
node scripts/build-all.js deepseek-r1-test --en

# Build both
node scripts/build-all.js deepseek-r1-zh
```

Outputs go to `papers/<name>/`:
- `index.html` — combined HTML course
- `*.pdf` — PDF export (via Chrome headless)
- `presentation.pptx` — PPTX with embedded screenshots
- `screenshots/` — per-module PNG screenshots

**Prerequisites:**
```bash
npm install -g pptxgenjs puppeteer-core
# Chrome or Chromium must be installed and in PATH
```

---

## 🔌 Extending with CLI Tools (codex, openclaw, etc.)

The `npx skills add` command works for any Claude Code-compatible skill — not just paper-to-course.

### Install other CLI tools as skills

```bash
# Install Codex (OpenAI's coding agent)
npx skills add openai/codex

# Install skill-publisher (automated GitHub publishing)
npx skills add joeseesun/skill-publisher

# Install community skills from any GitHub repo
npx skills add <owner>/<repo>
```

### openclaw Integration

[openclaw](https://openclaw.ai) is a local AI agent that integrates with Claude Code. To use paper-to-course with openclaw:

```bash
# Install openclaw
curl -fsSL https://openclaw.ai/install.sh | bash
openclaw onboard

# Install paper-to-course skill in openclaw
# Method A: Copy to openclaw skills directory
cp -r paper-to-course ~/.openclaw/skills/

# Method B: Via openclaw CLI (if supported in your version)
openclaw skills add paper-to-course

# Method C: Via openclaw Web IDE
# Navigate to Settings → Skills → Add Skill → point to the SKILL.md file
```

**openclaw Webhook Integration:** For remote execution, configure the openclaw webhook in your `~/.claude/settings.json`:

```json
{
  "openclaw": {
    "webhookUrl": "http://<your-openclaw-instance>:8080/webhook"
  }
}
```

### Claude Code Plugin Marketplace

Several plugin marketplaces exist for sharing skills:

| Marketplace | Command | Notes |
|------------|---------|-------|
| Anthropic official | `/plugin marketplace add anthropics/skills` | `/plugin install <skill>` |
| Community | `/plugin marketplace add jamesrochabrun/skills` | 24+ skills |
| Focus.AI | `/plugin marketplace add the-focus-ai/claude-marketplace` | Theming + workflows |

---

## 🌍 Publishing to Claude Code Skills Platform

### Option A: Publish via GitHub (Recommended)

The skills ecosystem is GitHub-based. To publish:

1. **Create a public GitHub repository** with your skill
2. **Add a valid `SKILL.md`** with YAML frontmatter:
   ```yaml
   ---
   name: paper-to-course
   description: Transform any paper into an interactive HTML course + PPTX + PDF
   ---
   ```
3. **Write clear documentation** in `SKILL.md` (see existing examples)
4. **Add a `README.md`** with installation instructions
5. **Register with a marketplace** (optional):
   ```bash
   # Use skill-publisher to automate
   npx skills add joeseesun/skill-publisher
   # Then: "Publish my skill to GitHub"
   ```
6. **Share** — users install via `npx skills add <owner>/<repo>`

### Option B: Plugin Marketplace Submission

Submit a PR to an official marketplace:
- **Anthropic skills:** PR to `github.com/anthropics/skills`
- **Community marketplaces:** PR to their respective repos

### Option C: openclaw Skills Platform

For the openclaw ecosystem:
1. Publish to GitHub
2. Submit to the [openclaw skills registry](https://openclaw.ai/skills)
3. Or use the openclaw onboard wizard → Skills → Add from GitHub

---

## 🎓 Use Cases

| Who | How it helps |
|-----|-------------|
| **ML/AI Researchers** | Rapidly understand a new paper's contributions |
| **PhD Students** | Structured, interactive walkthrough of a subfield |
| **Research Teams** | Create onboarding materials for new lab members |
| **Educators** | Turn papers into teaching materials with built-in quizzes |
| **Tech Leads** | Evaluate if a paper's method fits production needs |

---

## 🆚 What makes this different?

- **Generates the course** — not just a summary. Structured modules, not bullet points.
- **Explains formulas** — every equation broken down line-by-line in plain English
- **Visualizes the evolution** — literature timelines show *how* the field developed
- **Compares methods** — not just listing them, but showing trade-offs interactively
- **Lets you test yourself** — built-in quizzes verify actual understanding
- **All outputs in one folder** — HTML + PDF + PPTX, no scattered files

---

## 🔧 Customization

All CSS and JS are in `references/` — copy them into your course directory:

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
- Node.js (for PPTX generation)
- Chrome or Chromium (for PDF generation)
- A paper in PDF or LaTeX format

---

## 📜 License

MIT — free to use, modify, and distribute. Attribution appreciated.
