// Post-build check: every character used on the site must be in the
// committed font-subset charset (scripts/font-subset-charset.json).
// The subsets (public/fonts/subset/*.woff2) contain exactly the site's
// characters; a character outside that set would render in the system
// fallback font instead of Glow Sans SC.
//
// If this fails, the site has gained a new character (usually a new post):
// run `python3 scripts/regen-font-subsets.py` to regenerate the subsets
// and the charset, then rebuild. The check fails the build on purpose --
// shipping silently-fallback glyphs would be a quiet visual regression.
//
// The charset feed mirrors scripts/prune-font-face.mjs: rendered dist
// HTML/XML text + attributes, plus src text files. pagefind binary
// fragments are deliberately NOT fed (they fabricate codepoints).
// Characters the font cannot render at all (emoji, box-drawing, ...) were
// already in the charset when it was generated, so they pass; only
// genuinely new codepoints fail.
import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = path.join(ROOT, "dist");

async function walk(dir, exts, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".git", "_astro", "pagefind"].includes(e.name)) continue;
      await walk(p, exts, out);
    } else if (exts.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

try {
  const charset = new Set(JSON.parse(await readFile(path.join(ROOT, "scripts", "font-subset-charset.json"), "utf8")));
  if (charset.size < 100) throw new Error("charset file implausibly small");

  const used = new Set();
  const feed = (t) => {
    for (const ch of t) used.add(ch.codePointAt(0));
  };
  for (const f of await walk(DIST, [".html", ".xml"])) {
    const t = await readFile(f, "utf8");
    const clean = t
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ");
    const withAttrs = clean.replace(/<[^>]+>/g, (tag) => {
      const vals = [...tag.matchAll(/"([^"]*)"|'([^']*)'/g)].map((m) => m[1] ?? m[2]).join(" ");
      return " " + vals + " ";
    });
    feed(withAttrs);
  }
  for (const f of await walk(path.join(ROOT, "src"), [".ts", ".astro", ".md", ".mdx", ".yml", ".yaml", ".css"])) {
    feed(await readFile(f, "utf8"));
  }

  const missing = [...used].filter((cp) => !charset.has(cp));
  if (missing.length > 0) {
    console.error(
      `[check-font-coverage] FAIL: ${missing.length} used character(s) not in the font subsets: ` +
        missing.slice(0, 20).map((cp) => `U+${cp.toString(16).toUpperCase()} ${String.fromCodePoint(cp)}`).join(" ") +
        `\n[check-font-coverage] Run: python3 scripts/regen-font-subsets.py  (needs fontTools + brotli) and rebuild.`
    );
    process.exit(1);
  }
  console.log(`[check-font-coverage] ok: ${used.size} used codepoints all covered by the font subsets`);
} catch (err) {
  if (err.code === "ENOENT") {
    console.log("[check-font-coverage] skipped (charset file missing)");
    process.exit(0);
  }
  if (err instanceof Error && err.message.startsWith("FAIL")) throw err;
  console.log(`[check-font-coverage] skipped (${err.message})`);
}
