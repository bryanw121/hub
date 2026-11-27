#!/usr/bin/env node
// Checks that hub/ and every projects/<name>/ stand alone:
//   - nothing references a path above the folder's own root (../ escapes, symlinks out)
//   - no package.json or lockfile at the repo root (no shared workspace)
//   - each folder has a README.md
// Exit 1 with a list of problems, so CI fails the pull request.
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync } from "node:fs";
import { join, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".git", ".next", "dist", "out", "build", ".vercel", ".turbo"]);
const TEXT = /\.(m?[jt]sx?|cjs|json|html?|css|scss|md|ya?ml|toml|vue|svelte|astro|py|sh)$/i;
// A relative path in quotes, url(), src/href, import/require: '../x', "./a/../../y"
const REL = /(?:["'`(]|\bfrom\s+|\bimport\s+|\brequire\(\s*)(\.{1,2}\/[^"'`)\s]*)/g;

const problems = [];
const units = ["hub", ...(existsSync(join(root, "projects"))
  ? readdirSync(join(root, "projects")).filter((d) => !d.startsWith(".") && lstatSync(join(root, "projects", d)).isDirectory())
      .map((d) => join("projects", d))
  : [])];

for (const f of ["package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "pnpm-workspace.yaml"])
  if (existsSync(join(root, f))) problems.push(`${f} at the repo root: each folder keeps its own dependencies`);

function walk(unitAbs, dirAbs) {
  for (const f of readdirSync(dirAbs)) {
    if (SKIP.has(f)) continue;
    const p = join(dirAbs, f);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) {
      const target = resolve(dirname(p), readlinkSync(p));
      if (!target.startsWith(unitAbs + sep)) problems.push(`${relative(root, p)}: symlink points outside its folder`);
      continue;
    }
    if (st.isDirectory()) { walk(unitAbs, p); continue; }
    if (!TEXT.test(f) || st.size > 2_000_000) continue;
    const text = readFileSync(p, "utf8");
    for (const m of text.matchAll(REL)) {
      const target = resolve(dirname(p), m[1]);
      if (target !== unitAbs && !target.startsWith(unitAbs + sep)) {
        const line = text.slice(0, m.index).split("\n").length;
        problems.push(`${relative(root, p)}:${line}: "${m[1]}" reaches outside ${relative(root, unitAbs)}/`);
      }
    }
  }
}

for (const u of units) {
  const abs = join(root, u);
  if (!existsSync(join(abs, "README.md"))) problems.push(`${u}/ has no README.md`);
  walk(abs, abs);
}

if (problems.length) {
  console.error("Folders must stand alone:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`OK: ${units.length} independent folder(s): ${units.join(", ")}`);
