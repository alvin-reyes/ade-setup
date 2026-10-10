#!/usr/bin/env node
/**
 * Validate the agent definitions against the contract ADE parses them with.
 *
 * ADE reads these files directly — `src/data/roles.ts` holds no prose and
 * parses `vendor/ade-setup/agents/*.md` at build time. That makes this
 * repository the source of truth, and it makes a malformed definition ADE's
 * problem: a missing "## What you own" silently parses to no owned globs, and a
 * renamed BMAD task sends a running agent to a command that does not exist.
 *
 * Those checks used to live only in ADE, which meant breakage was found after
 * someone re-vendored. They belong here, before a release exists.
 *
 *   node scripts/validate.mjs
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AGENTS = join(ROOT, "agents");
const TASKS = join(ROOT, "bmad", "bmad-core", "tasks");

const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

/** The body of a "## Heading" section, up to the next heading. */
function section(body, heading) {
  const i = body.indexOf(heading);
  if (i < 0) return null;
  const rest = body.slice(i + heading.length);
  const next = rest.search(/^## /m);
  return next < 0 ? rest : rest.slice(0, next);
}

const files = readdirSync(AGENTS).filter((f) => f.endsWith(".md")).sort();
if (files.length === 0) fail("agents/", "no definitions found");

for (const file of files) {
  const id = file.replace(/\.md$/, "");
  const body = readFileSync(join(AGENTS, file), "utf8");

  // 1. A title ADE can show in the picker.
  if (!/^#\s+\S/m.test(body)) fail(file, 'no "# Title" heading');

  // 2. Ownership as data. Prose here parses to an empty `owns` array, so the
  //    role silently appears to be steward of nothing.
  const owns = section(body, "## What you own");
  if (owns === null) fail(file, 'no "## What you own" section');
  else if (!/^- `[^`]+`\s*$/m.test(owns) && !owns.includes("No artifacts"))
    fail(file, '"## What you own" has no glob bullets and does not say "No artifacts"');

  // 3. Boundaries, under any of the three headings in use.
  if (!/^## (Boundaries|Anti-patterns)/m.test(body)) fail(file, "no boundaries section");

  // 4. Its own knowledge file and no other role's. Pointing at another role's
  //    file would have one agent reading notes written for a different job.
  const refs = [...new Set(Array.from(body.matchAll(/\.ade\/knowledge\/([a-z-]+)\.md/g), (m) => m[1]))];
  if (refs.length === 0) fail(file, "does not point at a knowledge file");
  else if (refs.length > 1 || refs[0] !== id) fail(file, `points at ${refs.join(", ")} instead of its own knowledge file`);

  // 5. No project knowledge in a shared definition. A dated entry is the shape
  //    a knowledge write takes, so one here means it landed in the wrong file —
  //    and would ship one project's specifics to every other project.
  const dated = body.match(/^-?\s*\d{4}-\d{2}-\d{2}\b/m);
  if (dated) fail(file, `contains a dated entry (${dated[0].trim()}) — that belongs in a project's knowledge store`);

  // 6. Every BMAD task named here must actually ship, or the agent is sent to
  //    a /BMad:tasks: command that does not exist. A role carries one section
  //    per BMAD version and ADE hands an agent only its project's; v4 tasks
  //    ship here, v6 skills are vendored by ADE and checked there.
  const v4 = section(body, "## BMAD tasks (v4)");
  const v6 = section(body, "## BMAD tasks (v6)");
  if (/^## BMAD tasks\s*$/m.test(body))
    fail(file, '"## BMAD tasks" has no version; name it "## BMAD tasks (v4)" or "(v6)"');
  if (v6 !== null && v4 === null) fail(file, '"## BMAD tasks (v6)" without a "(v4)" section for v4 projects');
  if (v4) {
    if (!v4.includes(".bmad-core/tasks/"))
      fail(file, '"## BMAD tasks (v4)" gives only the Claude Code command; other providers need the file path');
    for (const [, task] of v4.matchAll(/^- `([a-z0-9-]+)`/gm)) {
      if (!existsSync(join(TASKS, `${task}.md`))) fail(file, `names BMAD task "${task}", which this repo does not ship`);
    }
  }
  if (v6) {
    // A v6 project has no .bmad-core: a v4 command or path here sends the agent nowhere.
    if (/\/BMad:tasks:|\.bmad-core\/tasks\//.test(v6))
      fail(file, '"## BMAD tasks (v6)" points at v4 tasks, which v6 projects do not have');
    for (const [, skill] of v6.matchAll(/^- `([a-z0-9-]+)`/gm)) {
      if (!skill.startsWith("bmad")) fail(file, `"## BMAD tasks (v6)" names "${skill}", which is not a BMAD v6 skill`);
    }
  }
}

// 7. The manifest ADE reads to understand the repository.
try {
  const manifest = JSON.parse(readFileSync(join(ROOT, "ade.json"), "utf8"));
  if (typeof manifest.format !== "number") fail("ade.json", "no numeric format version");
} catch (err) {
  fail("ade.json", `unreadable: ${err.message}`);
}

// 8. The template a project is scaffolded from, and the boundary that keeps the
//    knowledge store from quietly replacing the context store.
const tpl = join(ROOT, "templates", "knowledge", "README.md");
if (!existsSync(tpl)) fail("templates/knowledge/README.md", "missing");
else if (!readFileSync(tpl, "utf8").includes(".ade/context/"))
  fail("templates/knowledge/README.md", "does not state the boundary against the context store");

if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("");
  process.exit(1);
}
console.log(`${files.length} definitions valid`);
