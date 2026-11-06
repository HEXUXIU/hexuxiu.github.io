// Post-build: drop @font-face declarations whose unicode-range covers no
// character used anywhere on the site. Rendering is unchanged: a dropped
// block only ever served glyphs that never appear in the built output.
// Fail-open: any unexpected condition leaves the CSS untouched (exit 0).
// Run as the last step of `bun run build` (see package.json).
import { readdir, readFile, writeFile } from "node:fs/promises";
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
      if (["node_modules", ".git", "_astro"].includes(e.name)) continue;
      await walk(p, exts, out);
    } else if (exts.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

function parseRange(spec) {
  const out = [];
  for (let tok of spec.split(",")) {
    tok = tok.trim().replace(/^U\+/i, "");
    if (!tok) continue;
    if (tok.includes("?")) {
      out.push([parseInt(tok.replace(/\?/g, "0"), 16), parseInt(tok.replace(/\?/g, "F"), 16)]);
    } else if (tok.includes("-")) {
      const [a, b] = tok.split("-");
      out.push([parseInt(a, 16), parseInt(b, 16)]);
    } else {
      const v = parseInt(tok, 16);
      if (!Number.isNaN(v)) out.push([v, v]);
    }
  }
  return out;
}

try {
  // 1. Used charset: rendered HTML (text + attribute values) + sources.
//    NOTE: do NOT feed dist/pagefind files: they are compressed binary index
//    fragments, not text. Decoding them as UTF-8 fabricates ~2600 codepoints
//    (e.g. U+3A7C7, U+50F42) that never appear on any page, which kept 536
//    dead @font-face blocks alive (626KB -> 233KB of @font-face text).
//    The search index is built from the same dist HTML text, so nothing
//    real is lost by skipping it.
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
  if (used.size < 100) throw new Error("charset implausibly small");

  // 2. Find the Layout CSS bundle.
  const astroDir = path.join(DIST, "_astro");
  const cssFile = (await readdir(astroDir)).find((n) => /^Layout\..*\.css$/.test(n));
  if (!cssFile) throw new Error("Layout CSS not found");
  const cssPath = path.join(astroDir, cssFile);
  const css = await readFile(cssPath, "utf8");
  const blocks = [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[0]);
  if (blocks.length < 10) throw new Error("too few @font-face blocks");

  // 3. Keep a block unless its unicode-range has zero intersection with `used`.
  //    Blocks without unicode-range are always kept.
  const kept = [];
  let droppedBytes = 0;
  let dropped = 0;
  for (const b of blocks) {
    const m = b.match(/unicode-range:\s*([^;}]+)/i);
    if (!m) {
      kept.push(b);
      continue;
    }
    const ranges = parseRange(m[1]);
    if (ranges.length === 0) {
      kept.push(b);
      continue;
    }
    const hit = ranges.some(([lo, hi]) => {
      for (let cp = lo; cp <= hi; cp++) if (used.has(cp)) return true;
      return false;
    });
    if (hit) kept.push(b);
    else {
      dropped++;
      droppedBytes += b.length;
    }
  }
  if (dropped === 0) {
    console.log("[prune-font-face] nothing to drop");
    process.exit(0);
  }

  // 4. Self-verify: every used codepoint still covered by a kept block that
  //    covered it before (per font family + weight). Abort on any regression.
  const coverage = (list) => {
    const map = new Map(); // key family|weight -> ranges
    for (const b of list) {
      const fam = (b.match(/font-family:\s*([^;]+)/i) || [])[1]?.trim() || "?";
      const w = (b.match(/font-weight:\s*([^;]+)/i) || [])[1]?.trim() || "?";
      const m = b.match(/unicode-range:\s*([^;}]+)/i);
      const ranges = m ? parseRange(m[1]) : [[0, 0x10ffff]];
      const key = fam + "|" + w;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(...ranges);
    }
    return map;
  };
  const before = coverage(blocks);
  const after = coverage(kept);
  for (const cp of used) {
    for (const [key, ranges] of before) {
      if (ranges.some(([lo, hi]) => cp >= lo && cp <= hi)) {
        const keptRanges = after.get(key) || [];
        if (!keptRanges.some(([lo, hi]) => cp >= lo && cp <= hi)) {
          throw new Error(`coverage regression for U+${cp.toString(16)} in ${key}`);
        }
      }
    }
  }

  // 5. Rewrite: replace the block run in the CSS with the kept blocks.
  let i = 0;
  const out = css.replace(/@font-face\s*\{[^}]*\}/g, () => kept[i++]);
  if (i !== blocks.length) throw new Error("block count mismatch");
  await writeFile(cssPath, out);
  console.log(
    `[prune-font-face] ${cssFile}: dropped ${dropped}/${blocks.length} @font-face blocks, ${(droppedBytes / 1024).toFixed(1)}KB saved (${(css.length / 1024).toFixed(1)}KB -> ${(out.length / 1024).toFixed(1)}KB), charset ${used.size} codepoints`
  );
} catch (err) {
  console.log(`[prune-font-face] skipped (${err.message})`);
}
