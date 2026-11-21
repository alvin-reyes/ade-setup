# ade-method

How agents work in an ADE project: the rules, the four core roles, and ADE's BMAD v6 settings. Small on purpose:
everything else is loaded only when a task needs it.

```
rules.md          the method (installed in a project as .ade/rules.md): plan only as needed, build test-first,
                  the reviewer's verification run decides Done, review scaled to risk, cost rules, a section for
                  people who don't write code
agents/           the core roles, provider-neutral Markdown, no front matter:
                  product · architect · developer · reviewer
ade.json          what ADE reads: the core roles, the pinned specialist registry and BMAD commit, and the BMAD skills
                  a project gets by default, on demand, or never
bmad/custom/      overrides for BMAD v6 skills (copied into a project's _bmad/custom/)
templates/        the context store, decision log, role knowledge and coding standards a project starts with
scripts/validate.mjs   the check this repo must pass: node scripts/validate.mjs
```

**Specialists** (frontend, backend, devops, sysadmin, qa, security-reviewer, analyst, monitor, support) live in
[ade-agent-registry](https://github.com/better-ade/ade-agent-registry), pinned in `ade.json`, and load only when a task
needs one. **Skills and MCP servers** live in [ade-skills](https://github.com/better-ade/ade-skills).

## Using it

ADE vendors this repo at a pinned tag:

```json
{ "agentConfig": { "repo": "git@github.com:better-ade/ade-method.git", "ref": "v2.0.0" } }
```

## Migrating from v1

v1 (tag `v1-final`) had a larger role set, BMAD v4 and a Claude-specific copy of the roles. In a v1 project, ADE
replaces `.ade/rules.md` and the four core role files, moves the retired role files and BMAD v4 into `.ade/archive/`,
and keeps `.ade/session.md` (the journal continues: one line per Done). Files a person edited are kept and reported,
never overwritten.

## Releasing

`node scripts/validate.mjs` passes, then tag `vX.Y.Z` on main.
