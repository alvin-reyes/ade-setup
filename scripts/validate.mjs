#!/usr/bin/env node
// Checks what ADE relies on: every registry role file exists, has a "# Title", a "## What you own" section with glob
// bullets or "No artifacts", a "## Boundaries" section, and no front matter; registry skill lists don't overlap; the
// BMAD overrides exist. Run: node scripts/validate.mjs [root]
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const ROOT = process.argv[2] || join(import.meta.dirname, "..");
const problems = [];
const fail = (f, m) => problems.push(`${f}: ${m}`);
const section = (b, h) => { const i = b.indexOf(`\n${h}\n`); if (i < 0) return null; const r = b.slice(i + h.length + 2); const n = r.search(/^## /m); return n < 0 ? r : r.slice(0, n); };
let reg;
try { reg = JSON.parse(readFileSync(join(ROOT, "ade.json"), "utf8")); } catch (e) { fail("ade.json", e.message); }
if (reg) {
  const names = new Set();
  for (const r of reg.core_roles || []) {
    if (names.has(r.name)) fail("ade.json", `role ${r.name} listed twice`); names.add(r.name);
    if (!r.description) fail("ade.json", `role ${r.name} has no description`);
    const p = join(ROOT, r.file || "");
    if (!r.file || !existsSync(p)) { fail("ade.json", `role ${r.name}: no file ${r.file}`); continue; }
    const b = readFileSync(p, "utf8");
    if (b.startsWith("---")) fail(r.file, "has front matter (ADE adds it when it projects the role)");
    if (!/^# \S/m.test(b)) fail(r.file, 'no "# Title"');
    const own = section(b, "## What you own");
    if (own === null) fail(r.file, 'no "## What you own"');
    else if (!/^- `[^`]+`/m.test(own) && !/No artifacts/.test(own)) fail(r.file, '"## What you own" has no glob bullets and no "No artifacts"');
    if (section(b, "## Boundaries") === null) fail(r.file, 'no "## Boundaries"');
  }
  const b = reg.bmad || {}, seen = new Map();
  for (const k of ["default_skills", "on_demand_skills", "never"]) for (const s of b[k] || []) {
    if (seen.has(s)) fail("ade.json", `skill ${s} is in both ${seen.get(s)} and ${k}`); seen.set(s, k);
  }
  for (const f of ["bmad-build.toml", "bmad-code-review.toml"]) if (!existsSync(join(ROOT, "bmad/custom", f))) fail("bmad/custom", `missing ${f}`);
}
if (!existsSync(join(ROOT, "rules.md"))) fail("rules.md", "missing");
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`ok: ${reg.core_roles.length} roles, ${seen_count(reg)} skills listed`);
function seen_count(r) { const b = r.bmad || {}; return ["default_skills", "on_demand_skills", "never"].reduce((n, k) => n + (b[k] || []).length, 0); }
