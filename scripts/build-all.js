#!/usr/bin/env node
/**
 * paper-to-course — Unified Build Pipeline
 *
 * Generates all output formats for a paper presentation:
 *   1. HTML course (combined index.html)
 *   2. PDF (from HTML, via Chrome headless)
 *   3. Per-module screenshots (for PPTX)
 *   4. PPTX presentation (with embedded screenshots + rich content)
 *
 * Usage:
 *   node build-all.js <paper-name> [--zh]
 *
 * Output goes to: papers/<paper-name>/
 *
 * Prerequisites:
 *   npm install -g pptxgenjs puppeteer-core
 *   Chrome or Chromium installed (google-chrome must be in PATH)
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// ─── Configuration ────────────────────────────────────────────────
const CHROME_BIN = process.env.CHROME_BIN || "/usr/bin/google-chrome";
const PUPPETEER_CORE_PATH = path.join(
  os.homedir(),
  ".nvm/versions/node/v24.13.0/lib/node_modules/puppeteer-core"
);
const PPTXGENJS_PATH = path.join(
  os.homedir(),
  ".nvm/versions/node/v24.13.0/lib/node_modules/pptxgenjs"
);

// ─── Helpers ─────────────────────────────────────────────────────
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

function chromeHeadless(url, outputPath, options = {}) {
  const {
    format = "pdf",    // "pdf" or "png"
    landscape = false,
    scale = 1.0,
    width = 1280,
    height = 720,
  } = options;

  const tmpDir = os.tmpdir();
  const tmpOut = path.join(tmpDir, `ptc_output_${Date.now()}.${format}`);

  let cmd = `"${CHROME_BIN}" --headless=new --no-sandbox --disable-gpu`;

  if (format === "pdf") {
    cmd += ` --print-to-pdf="${tmpOut}" --print-to-pdf-no-header`;
    if (landscape) cmd += " --print-to-pdf-landscape";
  } else {
    cmd += ` --screenshot="${tmpOut}" --window-size=${width},${height}`;
  }

  if (options.viewportWidth) cmd += ` --force-device-scale-factor=${scale}`;
  cmd += ` "${url}"`;

  const result = run(cmd, { silent: true });
  if (fs.existsSync(tmpOut)) {
    fs.copyFileSync(tmpOut, outputPath);
    fs.unlinkSync(tmpOut);
    return true;
  }
  return false;
}

// ─── Step 1: Build HTML index ─────────────────────────────────────
function buildHTML(courseDir, outputDir, refsDir) {
  console.log("📄 Building HTML course...");
  const combined = path.join(outputDir, "index.html");

  const baseFile = path.join(refsDir, "_base.html");
  const footerFile = path.join(refsDir, "_footer.html");
  const stylesFile = path.join(refsDir, "styles.css");
  const mainFile = path.join(refsDir, "main.js");
  const modulesDir = path.join(courseDir, "modules");

  if (!fs.existsSync(baseFile)) {
    console.error("  ✗ _base.html not found in references/");
    return false;
  }

  // Read base HTML
  let baseHTML = fs.readFileSync(baseFile, "utf8");
  const footerHTML = fs.existsSync(footerFile) ? fs.readFileSync(footerFile, "utf8") : "";

  // Inline CSS and JS into base HTML
  const cssContent = fs.existsSync(stylesFile) ? fs.readFileSync(stylesFile, "utf8") : "";
  const jsContent = fs.existsSync(mainFile) ? fs.readFileSync(mainFile, "utf8") : "";

  baseHTML = baseHTML.replace(`<link rel="stylesheet" href="styles.css">\n  <!-- INLINE_CSS -->`, `<style>\n${cssContent}\n</style>`);
  baseHTML = baseHTML.replace(`<script src="main.js" defer></script>\n  <!-- INLINE_JS -->`, `<script>\n${jsContent}\n</script>`);

  // Concatenate: _base.html + module-*.html + _footer.html
  const parts = [baseHTML];

  const modules = fs.readdirSync(modulesDir)
    .filter(f => f.startsWith("module-") && f.endsWith(".html"))
    .sort();

  for (const mod of modules) {
    parts.push(fs.readFileSync(path.join(modulesDir, mod), "utf8"));
  }

  if (footerHTML) {
    parts.push(footerHTML);
  }

  fs.writeFileSync(combined, parts.join("\n"), "utf8");
  const size = (fs.statSync(combined).size / 1024).toFixed(1);
  console.log(`  ✓ index.html (${size} KB)`);
  return true;
}

// ─── Step 2: HTML → PDF ──────────────────────────────────────────
function buildPDF(indexPath, outputPath) {
  console.log("📕 Converting HTML → PDF...");
  const url = `file://${indexPath}`;

  if (chromeHeadless(url, outputPath, { format: "pdf", landscape: false })) {
    const size = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  ✓ ${path.basename(outputPath)} (${size} KB)`);
    return true;
  } else {
    console.error("  ✗ PDF generation failed");
    return false;
  }
}

// ─── Step 3: Take screenshots of each module ───────────────────
async function buildScreenshots(courseDir, outputDir, refsDir) {
  console.log("🖼️  Taking module screenshots...");
  const shotsDir = path.join(outputDir, "screenshots");
  ensureDir(shotsDir);

  const baseFile = path.join(refsDir, "_base.html");
  const footerFile = path.join(refsDir, "_footer.html");
  const stylesFile = path.join(refsDir, "styles.css");
  const mainFile = path.join(refsDir, "main.js");
  const modulesDir = path.join(courseDir, "modules");
  const shotsBase = path.join(shotsDir, "module");

  let baseHTML = fs.readFileSync(baseFile, "utf8");
  const footerHTML = fs.existsSync(footerFile) ? fs.readFileSync(footerFile, "utf8") : "";
  const cssContent = fs.existsSync(stylesFile) ? fs.readFileSync(stylesFile, "utf8") : "";
  const jsContent = fs.existsSync(mainFile) ? fs.readFileSync(mainFile, "utf8") : "";
  baseHTML = baseHTML.replace(`<link rel="stylesheet" href="styles.css">\n  <!-- INLINE_CSS -->`, `<style>\n${cssContent}\n</style>`);
  baseHTML = baseHTML.replace(`<script src="main.js" defer></script>\n  <!-- INLINE_JS -->`, `<script>\n${jsContent}\n</script>`);

  const modules = fs.readdirSync(modulesDir)
    .filter(f => f.startsWith("module-") && f.endsWith(".html"))
    .sort();

  let puppeteer = null;
  try {
    puppeteer = require(PUPPETEER_CORE_PATH);
  } catch {
    console.error("  ✗ puppeteer-core not found. Run: npm install -g puppeteer-core");
    console.error("  ✗ Skipping screenshots. Install Chrome/Chromium for full support.");
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

  for (let i = 0; i < modules.length; i++) {
    const modFile = path.join(modulesDir, modules[i]);
    const modContent = fs.readFileSync(modFile, "utf8");
    const standalone = baseHTML.replace("<!-- MODULE_CONTENT -->", modContent) + footerHTML;

    const tmpFile = path.join(os.tmpdir(), `ptc_mod_${i}.html`);
    fs.writeFileSync(tmpFile, standalone, "utf8");

    const shotPath = `${shotsBase}-${String(i + 1).padStart(2, "0")}.png`;
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
    await page.goto(`file://${tmpFile}`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: shotPath, fullPage: true });
    await page.close();
    fs.unlinkSync(tmpFile);
    console.log(`  ✓ module-${String(i + 1).padStart(2, "0")}.png`);
  }
  await browser.close();
  return true;
}

// ─── Step 4: Build PPTX with screenshots ───────────────────────
async function buildPPTX(courseDir, outputDir, pptxScript, pptxContent) {
  console.log("📊 Building PPTX presentation...");

  // Patch the script to use absolute paths for modules
  pptxContent = pptxContent
    .replace('require("pptxgenjs")', `require("${PPTXGENJS_PATH.replace(/\\/g, "\\\\")}")`);

  // Write course-specific PPTX generator
  const scriptFile = path.join(outputDir, "generate-pptx.js");
  fs.writeFileSync(scriptFile, pptxContent, "utf8");

  const pptxPath = path.join(outputDir, "presentation.pptx");

  const result = run(`node "${scriptFile}" "${pptxPath}"`, { cwd: __dirname });

  if (fs.existsSync(pptxPath)) {
    const size = (fs.statSync(pptxPath).size / 1024).toFixed(1);
    console.log(`  ✓ presentation.pptx (${size} KB)`);
    return true;
  } else {
    console.error("  ✗ PPTX generation failed");
    return false;
  }
}

// ─── Main Pipeline ────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isZh = args.includes("--zh");
  const isEn = args.includes("--en");

  // Default: build both EN and ZH if no flag specified
  const buildZh = isZh || (!isZh && !isEn);
  const buildEn = isEn || (!isZh && !isEn);

  const skillRoot = path.resolve(__dirname, "..");
  const refsDir = path.join(skillRoot, "references");

  console.log("\n🚀 paper-to-course Unified Build Pipeline");
  console.log("=".repeat(50));

  if (buildEn) {
    await buildCourse(path.join(skillRoot, "deepseek-r1-test"), "deepseek-r1", "en", refsDir, skillRoot);
  }

  if (buildZh) {
    await buildCourse(path.join(skillRoot, "deepseek-r1-zh"), "deepseek-r1-zh", "zh", refsDir, skillRoot);
  }

  console.log("\n✅ Build complete!\n");
}

async function buildCourse(courseDir, paperName, lang, refsDir, skillRoot) {
  console.log(`\n📦 Building: ${paperName} (${lang})`);

  const outputDir = path.join(skillRoot, "papers", paperName);
  ensureDir(outputDir);

  // Copy reference files if not present
  const requiredFiles = ["_base.html", "_footer.html", "styles.css", "main.js"];
  for (const f of requiredFiles) {
    const src = path.join(refsDir, f);
    if (!fs.existsSync(src)) {
      console.error(`  ✗ Missing reference file: ${f}`);
      return;
    }
  }

  // Ensure modules dir exists
  const modulesDir = path.join(courseDir, "modules");
  if (!fs.existsSync(modulesDir)) {
    console.error(`  ✗ No modules/ directory in ${courseDir}`);
    console.error(`  ✗ Run the skill first to generate the HTML modules.`);
    return;
  }

  // Step 1: Build HTML
  if (!buildHTML(courseDir, outputDir, refsDir)) return;

  // Step 2: HTML → PDF
  const pdfPath = path.join(outputDir, `${paperName}.pdf`);
  buildPDF(path.join(outputDir, "index.html"), pdfPath);

  // Step 3: Screenshots
  await buildScreenshots(courseDir, outputDir, refsDir);

  // Step 4: PPTX
  const pptxScript = path.join(skillRoot, "scripts", "generate-pptx.js");
  if (fs.existsSync(pptxScript)) {
    const pptxContent = fs.readFileSync(pptxScript, "utf8");
    await buildPPTX(courseDir, outputDir, pptxScript, pptxContent);
  }
}

main().catch(console.error);
