#!/usr/bin/env node
/**
 * Work out the next version and write the release notes.
 *
 * The bump is derived from what changed in `agents/`, not from commit
 * messages. Commit conventions are a discipline that lapses; the file list is a
 * fact, and for a content repository it is also the thing consumers care about:
 *
 *   a definition removed or renamed  -> major   (a project naming it breaks)
 *   a definition added              -> minor   (new capability, nothing breaks)
 *   existing definitions edited     -> patch   (same roles, better wording)
 *
 * Prints `version=` and writes the notes to the file given as $1, in the shape
 * GitHub Actions wants.
 *
 *   node scripts/next-release.mjs notes.md
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const FIRST = "v1.0.0";

let last = "";
try {
  last = git("describe", "--tags", "--abbrev=0");
} catch {
  // No tags yet.
}

let version;
let changes = { added: [], removed: [], changed: [] };
let commits = [];

if (!last) {
  version = FIRST;
  commits = git("log", "--format=%s").split("\n").filter(Boolean);
} else {
  const status = git("diff", "--name-status", `${last}..HEAD`, "--", "agents/")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"));

  const name = (p) => p.split("/").pop().replace(/\.md$/, "");
  for (const [code, a, b] of status) {
    if (code.startsWith("D")) changes.removed.push(name(a));
    else if (code.startsWith("A")) changes.added.push(name(a));
    else if (code.startsWith("R")) { changes.removed.push(name(a)); changes.added.push(name(b)); }
    else changes.changed.push(name(a));
  }

  // Nothing shipped means nothing to release. The paths filter keeps CI from
  // firing on a docs-only push, but workflow_dispatch has no filter, and a
  // version whose notes say nothing teaches whoever reads the tag list to stop
  // reading it.
  const CONTENT = ["agents/", "templates/", "bmad/", "rules.md", "standards.md", "ade.json"];
  const shipped = git("diff", "--name-only", `${last}..HEAD`, "--", ...CONTENT)
    .split("\n")
    .filter(Boolean);
  if (shipped.length === 0) {
    console.log(`version=`);
    console.log(`previous=${last}`);
    console.log(`skip=nothing shipped since ${last}`);
    process.exit(0);
  }

  const [maj, min, pat] = last.replace(/^v/, "").split(".").map(Number);
  if (changes.removed.length) version = `v${maj + 1}.0.0`;
  else if (changes.added.length) version = `v${maj}.${min + 1}.0`;
  else version = `v${maj}.${min}.${pat + 1}`;

  commits = git("log", "--format=%s", `${last}..HEAD`).split("\n").filter(Boolean);
}

const lines = [];
if (changes.removed.length) {
  lines.push("### Removed", "", "A project that names one of these will no longer resolve it.", "",
    ...changes.removed.map((r) => `- \`${r}\``), "");
}
if (changes.added.length) lines.push("### Added", "", ...changes.added.map((r) => `- \`${r}\``), "");
if (changes.changed.length) lines.push("### Changed", "", ...changes.changed.map((r) => `- \`${r}\``), "");
if (commits.length) lines.push("### Commits", "", ...commits.map((c) => `- ${c}`), "");

lines.push(
  "### Updating a project",
  "",
  "Nothing pulls automatically. A project keeps the definitions it was set up",
  "with until someone updates it deliberately, and its `.ade/knowledge/` is",
  "never touched by an update.",
  "",
  "```sh",
  `ADE_SETUP_REF=${version} npm run sync:agents   # in the ADE repo`,
  "```",
);

const notesPath = process.argv[2];
if (notesPath) writeFileSync(notesPath, lines.join("\n") + "\n");

const total = changes.added.length + changes.removed.length + changes.changed.length;
console.log(`version=${version}`);
console.log(`previous=${last || "(none)"}`);
console.log(`definitions_touched=${total}`);
