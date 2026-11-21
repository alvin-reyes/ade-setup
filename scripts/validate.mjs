#!/usr/bin/env node
// Checks what ADE relies on: ade.json parses and lists the four core roles; each role file has a "# Title", a
// "## What you own" with glob bullets or "No artifacts", a "## Boundaries", no front matter, and names only BMAD skills
// that are default or on demand; skill lists don't overlap; every override is for a listed skill; rules and templates
// exist. Needs Node 18+. Run: node scripts/validate.mjs [root]
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const fail = (f, m) => problems.push(`${f}: ${m}`);
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const section = (b, h) => { const m = b.match(new RegExp(`^${h}[ \\t]*$`, "m")); if (!m) return null; const r = b.slice(m.index + m[0].length); const n = r.search(/^## /m); return n < 0 ? r : r.slice(0, n); };
let reg = null;
try { reg = JSON.parse(read(join(ROOT, "ade.json"))); } catch (e) { fail("ade.json", e.message); }
if (reg && typeof reg === "object") {
  if (reg.format !== 2) fail("ade.json", "format must be 2");
  for (const k of [reg.rules, ...(reg.templates || [])]) if (!k || !existsSync(join(ROOT, k))) fail("ade.json", `missing file ${k}`);
  const b = reg.bmad || {}, seen = new Map();
  for (const k of ["default_skills", "on_demand_skills", "never", "metadata"]) for (const s of b[k] || []) {
    if (seen.has(s)) fail("ade.json", `skill ${s} listed in ${seen.get(s)} and ${k}`); seen.set(s, k);
  }
  const usable = (s) => ["default_skills", "on_demand_skills"].includes(seen.get(s));
  const ov = join(ROOT, b.overrides || "bmad/custom");
  if (existsSync(ov)) for (const f of readdirSync(ov)) if (f.endsWith(".toml") && !usable(f.slice(0, -5))) fail("bmad/custom", `${f} overrides a skill that is not default or on demand`);
  if (!reg.specialists?.repo || !reg.specialists?.ref) fail("ade.json", "specialists needs repo and ref");
  if (!b.ref) fail("ade.json", "bmad.ref missing");
  const roles = Array.isArray(reg.core_roles) ? reg.core_roles : (fail("ade.json", "core_roles missing"), []);
  const names = new Set(roles.map((r) => r.name));
  for (const n of ["product", "architect", "developer", "reviewer"]) if (!names.has(n)) fail("ade.json", `core role ${n} missing`);
  for (const r of roles) {
    if (!r.name || !r.description) fail("ade.json", `role ${r.name || "?"} needs name and description`);
    const p = join(ROOT, r.file || "");
    if (!r.file || !existsSync(p) || !statSync(p).isFile()) { fail("ade.json", `role ${r.name}: no file ${r.file}`); continue; }
    const t = read(p);
    if (t.startsWith("---")) fail(r.file, "has front matter (ADE adds it when it projects the role)");
    if (!/^# \S/m.test(t)) fail(r.file, 'no "# Title"');
    const own = section(t, "## What you own");
    if (own === null) fail(r.file, 'no "## What you own"');
    else if (!/^- `[^`]+`/m.test(own) && !/No artifacts/.test(own)) fail(r.file, '"## What you own" has no glob bullets and no "No artifacts"');
    if (section(t, "## Boundaries") === null) fail(r.file, 'no "## Boundaries"');
    for (const s of (section(t, "## BMAD tasks \\(v6\\)") || "").match(/`(bmad-[a-z0-9-]+)`/g) || []) {
      const n = s.slice(1, -1); if (!usable(n)) fail(r.file, `names ${n}, which is not a default or on-demand skill`);
    }
  }
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`ok: ${reg.core_roles.length} core roles`);
