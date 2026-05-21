# paper-to-course

> Transform any academic paper into an interactive HTML course, Markdown study notes, and PPTX slides.

**paper-to-course** is a Codex-ready skill for turning research papers into teaching and study materials. It produces a self-contained scroll-based course with formula breakdowns, literature timelines, method comparisons, ablation diagrams, component chats, quizzes, plus matching Markdown notes and a seminar-style slide deck.

**Target users:** researchers who need to quickly understand a paper, students entering a new field, and teams preparing paper-sharing or onboarding material.

## Quick Start

### 1. Install for Codex

Copy this folder into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
cp -r paper-to-course ~/.codex/skills/
```

If your Codex setup supports skill installation from GitHub, you can also install it from the repository:

```bash
npx skills add KaguraTart/paper-to-course
```

Install the Node dependencies used by the build pipeline:

```bash
npm install
```

### 2. Use it in Codex

Open Codex in any workspace and ask:

```text
Use paper-to-course on papers/your-paper.pdf
```

or:

```text
Turn this paper into a course.
```

Codex will:

1. Read the PDF or LaTeX source and confirm the paper topic.
2. Design a 6-module curriculum.
3. Generate HTML modules with interactive elements.
4. Generate Markdown notes.
5. Generate a 16-page PPTX deck.
6. Bundle the HTML course into a single `index.html`.

Put source PDFs or LaTeX projects in `papers/` before running the skill. The folder is kept in Git, but its contents are ignored by default so local papers are not committed accidentally.

### 3. Open the course

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows PowerShell
```

No server is required. The HTML output is self-contained and works offline.

## What You Get

| Output | File | Description |
|--------|------|-------------|
| HTML course | `index.html` | Interactive single-page course with timelines, formulas, quizzes, and diagrams |
| Markdown notes | `README.md` | Plain-text study document preserving tables, formulas, and code |
| Slides | `slides.pptx` | 16-page presentation deck for reading groups or seminars |

Each HTML course includes 7 interactive element types:

| Element | What it does |
|---------|-------------|
| Formula Breakdown | Translates math formulas line by line into plain English |
| Literature Timeline | Shows the field's key milestones and method evolution |
| Comparison Table | Compares methods with trade-off analysis |
| Ablation Diagram | Visualizes how each component contributes to performance |
| Method Chat | Uses animated component conversations to explain the method |
| Comprehension Quiz | Tests understanding with multiple-choice questions |
| Glossary Tooltips | Explains technical terms on hover |

## Course Structure

Every paper course follows a 6-module structure:

1. **Problem & Motivation** - why the problem matters and what bottleneck the paper addresses.
2. **Literature Timeline** - how the field evolved and where this paper fits.
3. **SOTA Comparison** - current mainstream methods, strengths, and weaknesses.
4. **Method Deep Dive** - architecture, formulas, and algorithm flow.
5. **Experiments & Results** - benchmarks, ablations, and empirical findings.
6. **Limitations & Future Work** - open problems and next research directions.

## Repository Structure

```text
paper-to-course/
├── .codex-plugin/
│   └── plugin.json          # Codex plugin metadata
├── papers/                  # Local papers to process, ignored by Git
├── SKILL.md                 # Codex skill instructions
├── README.md                # English documentation
├── README_zh.md             # Chinese documentation
├── scripts/
│   ├── build-all.js         # Unified pipeline: HTML + Markdown + PPTX
│   ├── generate-pptx.js     # Data-driven PPTX generator
│   ├── slides-builder.js    # PPTX slide builder
│   └── html-to-md.js        # HTML to Markdown converter
└── references/
    ├── styles.css           # Design system and course components
    ├── main.js              # Interactive runtime
    ├── _base.html           # HTML template header
    ├── _footer.html         # HTML template footer
    └── paper-elements.md    # Implementation patterns for interactive elements
```

## Build Pipeline

After Codex generates a course directory with `modules/` and `slides-config.json`, run:

```bash
node scripts/build-all.js ./my-paper-course --output ./output
```

Common options:

```bash
node scripts/build-all.js ./my-paper-course --zh --output ./output
node scripts/build-all.js ./my-paper-course --en
node scripts/build-all.js ./output --slides-only
```

PPTX generation is a required part of the workflow. It uses `pptxgenjs`, which is installed by `npm install` from this repo's `package.json`.

## Design

- **Aesthetic:** warm developer notebook, off-white background `#FAF7F2` with coral accent `#D94F30`.
- **Fonts:** Bricolage Grotesque for headings, DM Sans for body text, JetBrains Mono for formulas and code.
- **Output:** self-contained `index.html`, mobile-friendly and offline-ready.

## Requirements

- Codex with local skill support.
- Node.js for Markdown and PPTX generation.
- `pptxgenjs` for required PPTX generation. Install it with `npm install`.
- Chrome or Chromium for screenshot-based build steps, when enabled.
- A paper in PDF or LaTeX format.

## License

MIT License. Free to use, modify, and distribute.
