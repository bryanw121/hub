#!/usr/bin/env node
// node scripts/new-project.mjs <name> [--template static] [--hub-url https://…] [--blurb "…"]
//
// Copies templates/<template>/ to projects/<name>/ and fills in __NAME__.
// With --hub-url, also adds a card for it to hub/tools.json.
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (k) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const template = flag("--template") || "static";
const hubUrl = flag("--hub-url");
const blurb = flag("--blurb") || "A new project";
const name = args[0];

const die = (m) => { console.error(m); process.exit(1); };
if (!name || !/^[a-z0-9][a-z0-9-]{0,40}$/.test(name))
  die("Usage: node scripts/new-project.mjs <name>   (lowercase letters, digits, dashes)");
const src = join(root, "templates", template);
const dest = join(root, "projects", name);
if (!existsSync(src)) die(`No template "${template}". Have: ${readdirSync(join(root, "templates")).join(", ")}`);
if (existsSync(dest)) die(`projects/${name} already exists`);

cpSync(src, dest, { recursive: true });
const fill = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== "node_modules") fill(p); continue; }
    const s = readFileSync(p, "utf8");
    if (s.includes("__NAME__")) writeFileSync(p, s.replaceAll("__NAME__", name));
  }
};
fill(dest);
console.log(`Created projects/${name} from templates/${template}`);

if (hubUrl) {
  const p = join(root, "hub", "tools.json");
  const tools = JSON.parse(readFileSync(p, "utf8"));
  if (tools.some((t) => t.id === name)) die(`hub/tools.json already has "${name}"`);
  const title = name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  tools.push({ id: name, name: title, blurb, url: hubUrl, icon: "box", tint: "#E0E9FF", ink: "#1F4FC9" });
  writeFileSync(p, JSON.stringify(tools, null, 2) + "\n");
  console.log(`Added a "${title}" card to hub/tools.json`);
}
console.log(`Next: build in projects/${name}, then deploy with Root Directory projects/${name}.`);
