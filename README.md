# ade-method

How agents work in an ADE project: the rules, the four core roles, and ADE's BMAD v6 settings. Small on purpose:
everything else is loaded only when a task needs it.

```
rules.md          the method: plan only as needed, build test-first, the verification command decides Done,
                  review scaled to risk, cost rules
agents/           the core roles, provider-neutral Markdown, no front matter:
                  product · architect · developer · reviewer
ade.json          what ADE reads: the core roles, the BMAD skills a project gets by default, on demand, or never,
                  and where specialists live
bmad/custom/      overrides for BMAD v6 skills (copied into a project's _bmad/custom/)
templates/        the context store, decision log, role knowledge and coding standards a project starts with
scripts/validate.mjs   the check this repo must pass: node scripts/validate.mjs
```

**Specialists** (frontend, backend, devops, sysadmin…) live in
[ade-agent-registry](https://github.com/better-ade/ade-agent-registry) and are added to a project only when a task
needs one. **Skills and MCP servers** live in [ade-skills](https://github.com/better-ade/ade-skills).

## Using it

ADE vendors this repo at a pinned tag:

```json
{ "agentConfig": { "repo": "git@github.com:better-ade/ade-method.git", "ref": "v2.0.0" } }
```

A file that already exists in a project is never overwritten.

## Releasing

`node scripts/validate.mjs` passes, then tag `vX.Y.Z` on main. v1 (19 roles, BMAD v4 and v6) is tagged `v1-final`.
