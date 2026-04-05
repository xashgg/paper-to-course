#!/usr/bin/env node
/**
 * paper-to-course — Unified Build Pipeline
 *
 * Generates all output formats for a paper course:
 *   1. HTML course (combined index.html)
 *   2. Markdown document (readable text version with code/formulas)
 *   3. PPTX presentation (from slides-config.json)
 *   4. Per-module screenshots (for PPTX embedding)
 *
 * Usage:
 *   node build-all.js <paper-name> [--zh] [--en] [--slides-only]
 *
 * Prerequisites:
 *   npm install -g pptxgenjs puppeteer-core
 *   Chrome or Chromium installed (set CHROME_BIN env var or use /usr/bin/google-chrome)
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// ─── Configuration ───────────────────────────────────────────────
const CHROME_BIN = process.env.CHROME_BIN || "/usr/bin/google-chrome";
const PUPPETEER_CORE_PATH = path.join(
  os.homedir(),
  ".nvm/versions/node/v24.13.0/lib/node_modules/puppeteer-core"
);
const PPTXGENJS_PATH = path.join(
  os.homedir(),
  ".nvm/versions/node/v24.13.0/lib/node_modules/pptxgenjs"
);

// ─── Helpers ──────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: opts.silent ? "pipe" : "inherit",
      ...opts,
    });
  } catch (e) {
    if (!opts.silent) console.error("ERROR:", e.message);
    return null;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Step 1: Build HTML index ────────────────────────────────────
function buildHTML(courseDir, outputDir, refsDir) {
  console.log("📄 Building HTML course...");
  const combined = path.join(outputDir, "index.html");

  let baseHTML = fs.readFileSync(path.join(refsDir, "_base.html"), "utf8");
  const footerHTML = fs.existsSync(path.join(refsDir, "_footer.html"))
    ? fs.readFileSync(path.join(refsDir, "_footer.html"), "utf8") : "";
  const cssContent = fs.existsSync(path.join(refsDir, "styles.css"))
    ? fs.readFileSync(path.join(refsDir, "styles.css"), "utf8") : "";
  const jsContent = fs.existsSync(path.join(refsDir, "main.js"))
    ? fs.readFileSync(path.join(refsDir, "main.js"), "utf8") : "";
  const modulesDir = path.join(courseDir, "modules");

  // Inline CSS and JS
  baseHTML = baseHTML.replace(
    `<link rel="stylesheet" href="styles.css">\n  <!-- INLINE_CSS -->`,
    `<style>\n${cssContent}\n</style>`
  );
  baseHTML = baseHTML.replace(
    `<script src="main.js" defer></script>\n  <!-- INLINE_JS -->`,
    `<script>\n${jsContent}\n</script>`
  );

  const parts = [baseHTML];
  const modules = fs.readdirSync(modulesDir)
    .filter(f => f.startsWith("module-") && f.endsWith(".html"))
    .sort();

  for (const mod of modules) {
    parts.push(fs.readFileSync(path.join(modulesDir, mod), "utf8"));
  }
  if (footerHTML) parts.push(footerHTML);

  fs.writeFileSync(combined, parts.join("\n"), "utf8");
  const size = (fs.statSync(combined).size / 1024).toFixed(1);
  console.log(`  ✓ index.html (${size} KB)`);
  return true;
}

// ─── Step 2: Build Markdown ───────────────────────────────────────
function buildMarkdown(indexPath, outputDir) {
  console.log("📝 Converting HTML → Markdown...");
  try {
    const { htmlToMarkdown } = require("./html-to-md.js");
    const html = fs.readFileSync(indexPath, "utf8");
    const md = htmlToMarkdown(html);
    const mdPath = path.join(outputDir, "README.md");
    fs.writeFileSync(mdPath, md, "utf8");
    const size = (Buffer.byteLength(md, "utf8") / 1024).toFixed(1);
    console.log(`  ✓ README.md (${size} KB)`);
    return true;
  } catch (e) {
    console.error(`  ✗ Markdown conversion failed: ${e.message}`);
    return false;
  }
}

// ─── Step 3: Build PPTX from config ──────────────────────────────
async function buildPPTX(outputDir) {
  const configPath = path.join(outputDir, "slides-config.json");
  if (!fs.existsSync(configPath)) {
    console.log("  ⚠ No slides-config.json found — skipping PPTX");
    return false;
  }

  console.log("📊 Building PPTX presentation...");
  const pptxScript = path.join(outputDir, "generate-pptx.js");

  // Copy/generate PPTX script
  const templateScript = path.join(__dirname, "generate-pptx.js");
  fs.writeFileSync(pptxScript, fs.readFileSync(templateScript, "utf8")
    .replace('require("pptxgenjs")', `require("${PPTXGENJS_PATH.replace(/\\/g, "\\\\")}")`));

  const pptxPath = path.join(outputDir, "presentation.pptx");
  run(`node "${pptxScript}" "${pptxPath}" --config "${configPath}"`, { cwd: __dirname });

  if (fs.existsSync(pptxPath)) {
    const size = (fs.statSync(pptxPath).size / 1024).toFixed(1);
    console.log(`  ✓ presentation.pptx (${size} KB)`);
    return true;
  } else {
    console.error("  ✗ PPTX generation failed");
    return false;
  }
}

// ─── Step 4: Take screenshots of each module ─────────────────────
async function buildScreenshots(courseDir, outputDir, refsDir) {
  console.log("🖼️  Taking module screenshots...");
  const shotsDir = path.join(outputDir, "screenshots");
  ensureDir(shotsDir);

  let puppeteer;
  try {
    puppeteer = require(PUPPETEER_CORE_PATH);
  } catch {
    console.error("  ✗ puppeteer-core not found. Run: npm install -g puppeteer-core");
    return false;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_BIN,
      args: ["--headless=new", "--no-sandbox", "--disable-gpu"],
    });
  } catch (e) {
    console.error(`  ✗ Failed to launch Chrome: ${e.message}`);
    return false;
  }

  const baseHTML = fs.readFileSync(path.join(refsDir, "_base.html"), "utf8");
  const footerHTML = fs.existsSync(path.join(refsDir, "_footer.html"))
    ? fs.readFileSync(path.join(refsDir, "_footer.html"), "utf8") : "";
  const cssContent = fs.existsSync(path.join(refsDir, "styles.css"))
    ? fs.readFileSync(path.join(refsDir, "styles.css"), "utf8") : "";
  const jsContent = fs.existsSync(path.join(refsDir, "main.js"))
    ? fs.readFileSync(path.join(refsDir, "main.js"), "utf8") : "";
  const modulesDir = path.join(courseDir, "modules");

  let base = baseHTML
    .replace(`<link rel="stylesheet" href="styles.css">\n  <!-- INLINE_CSS -->`, `<style>\n${cssContent}\n</style>`)
    .replace(`<script src="main.js" defer></script>\n  <!-- INLINE_JS -->`, `<script>\n${jsContent}\n</script>`);

  const modules = fs.readdirSync(modulesDir)
    .filter(f => f.startsWith("module-") && f.endsWith(".html"))
    .sort();

  for (let i = 0; i < modules.length; i++) {
    const modContent = fs.readFileSync(path.join(modulesDir, modules[i]), "utf8");
    const standalone = base.replace("<!-- MODULE_CONTENT -->", modContent) + footerHTML;
    const tmpFile = path.join(os.tmpdir(), `ptc_mod_${i}.html`);
    fs.writeFileSync(tmpFile, standalone, "utf8");

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
    await page.goto(`file://${tmpFile}`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(shotsDir, `module-${String(i + 1).padStart(2, "0")}.png`),
      fullPage: true
    });
    await page.close();
    fs.unlinkSync(tmpFile);
    console.log(`  ✓ module-${String(i + 1).padStart(2, "0")}.png`);
  }

  await browser.close();
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isZh = args.includes("--zh");
  const isEn = args.includes("--en");
  const slidesOnly = args.includes("--slides-only");

  const buildZh = isZh || (!isZh && !isEn);
  const buildEn = isEn || (!isZh && !isEn);

  const skillRoot = path.resolve(__dirname, "..");
  const refsDir = path.join(skillRoot, "references");

  console.log("\n🚀 paper-to-course Build Pipeline");
  console.log("=".repeat(50));

  if (buildEn) {
    await buildCourse(
      path.join(skillRoot, "examples", "deepseek-r1"),
      "deepseek-r1", "en", refsDir, skillRoot, slidesOnly
    );
  }

  if (buildZh) {
    await buildCourse(
      path.join(skillRoot, "examples", "deepseek-r1-zh"),
      "deepseek-r1-zh", "zh", refsDir, skillRoot, slidesOnly
    );
  }

  console.log("\n✅ Build complete!\n");
}

async function buildCourse(courseDir, paperName, lang, refsDir, skillRoot, slidesOnly) {
  console.log(`\n📦 Building: ${paperName} (${lang})`);

  const outputDir = path.join(skillRoot, "papers", paperName);
  ensureDir(outputDir);

  const modulesDir = path.join(courseDir, "modules");
  if (!fs.existsSync(modulesDir)) {
    console.error(`  ✗ No modules/ directory in ${courseDir}`);
    return;
  }

  // Copy slides-config.json if present
  const configSrc = path.join(courseDir, "slides-config.json");
  const configDst = path.join(outputDir, "slides-config.json");
  if (fs.existsSync(configSrc)) {
    fs.copyFileSync(configSrc, configDst);
  }

  if (!slidesOnly) {
    // Step 1: HTML
    if (!buildHTML(courseDir, outputDir, refsDir)) return;

    // Step 2: Markdown
    buildMarkdown(path.join(outputDir, "index.html"), outputDir);
  }

  // Step 3: Screenshots
  await buildScreenshots(courseDir, outputDir, refsDir);

  // Step 4: PPTX
  await buildPPTX(outputDir);
}

main().catch(console.error);
