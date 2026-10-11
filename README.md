# ade-setup

Shared ADE agent configuration: the role definitions and the methodology, in a
form any provider can read.

ADE generates this into every project it opens. Keeping it in one repo means a
change to a role reaches every project that vendors it, instead of being frozen
at whatever the generator wrote the day the project was created.

## What's here

```
agents/<name>.md    14 role definitions, provider-neutral Markdown
rules.md            the ADE methodology: Plan → Approve → Shard → Build → Verify
standards.md        the project's coding standards (the architect fills this in)
context/            templates for the context store and the decision log
claude/             the Claude Code projection: CLAUDE.md and .claude/agents/
bmad/               vendored BMAD-METHOD v4: tasks, templates, checklists,
                    workflows and the /BMad:tasks: commands (no personas)
ade.json            which ADE version produced this
```

`agents/` holds the eight methodology roles plus six more the agent picker
offers — analyst, UX expert, product owner, brainstorming architect, technical
writer and advisor. The picker's `dev` is the same job as `developer` and is not
duplicated here.

`claude/` is the same eight roles with Claude Code's `name`/`description`/
`tools` frontmatter, plus the `CLAUDE.md` constitution. Copy it in when you want
Claude Code's sub-agent delegation; every other provider reads `agents/`.

## BMAD: v4 or v6

A project runs on one BMAD version, and `.ade/methodology` names it: `v4` or
`v6`. Nothing is downloaded at setup time; both are pinned copies of
[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD).

| | v4 | v6 |
|---|---|---|
| Lives in | `.bmad-core/` | `_bmad/`, with the skills in `.claude/skills/` |
| Run as | the `/BMad:tasks:` slash commands | skills |
| Work goes to | `docs/` | `_bmad-output/` (or the folder `_bmad/config.toml` names) |
| QA gates | `docs/qa/gates/` | `.ade/gates/` |
| Pinned copy | `bmad/` in this repository | ships with ADE |

The eight methodology roles in `agents/` each have a `## BMAD tasks (v4)` and a
`## BMAD tasks (v6)` section, and a project gets the one for its version.

### The choice

ADE asks before it writes anything: **BMAD v6** (the default) or **BMAD v4**.
The question has to be answered, and the answer is written to
`.ade/methodology`. A project that already has BMAD keeps its version without
being asked which to set up: one with a marker follows it, and one with
`.bmad-core/` and no marker is v4.

### No personas, in either version

BMAD ships its own agents, and eight of them are the same jobs as the roles in
`agents/`. Two `qa` agents with different definitions of Done is the worst kind
of duplication: a model can pick the one that bypasses the verification
command. So there is **one role set here, and it is `agents/`**.

What BMAD is valuable for stays. In v4 that is 21 tasks, 13 templates, 6
checklists, 6 workflows and its reference data, plus the `/BMad:tasks:` slash
commands; in v6 it is the skills. None of them reference an agent by name, so
they work unchanged against ADE's roles: an ADE role invokes a BMAD task the
same way it invokes any other tool. v4's `agent-teams/` went with the personas:
those files are bundles of the agents that no longer exist.

The ADE rules still win where they overlap: a BMAD task can never override the
verification command, the Definition of Done, or the constitution.

### Switching

A project can move to the other version at any time. Nothing is deleted: the
old version's files move into an archive inside the project, and the other
version is set up fresh.

| Direction | Moves to the archive |
|---|---|
| v4 → v6 | `.bmad-core/`, `.claude/commands/BMad/`, the debug log, `.ade/stage` |
| v6 → v4 | `_bmad/`, the output folder unless it holds your documents, ADE's BMAD skills in `.claude/skills/`, `.ade/approvals/`, `.ade/gates/` |
| Both | `.ade/methodology` and the eight core role files in `.claude/agents/` |

The rules, the context store, the journal, `.ade/knowledge/`, `CLAUDE.md` and
your own skills and agents stay. So does `docs/`: both versions use it, and a
document moves only when you ask for it.

### The archive

```
.ade/archive/
  bmad-v4-2026-10-11/     the version left, and the date (-2 for a second that day)
    ARCHIVE.md            the journal: what moved, its status, how to go back
    .bmad-core/           paths mirror the project
    .claude/commands/BMad/
    leftovers-v6/         files of the new version that were already there
```

The archive is read-only history, and `rules.md` says so (section 4): agents
never treat it as current documents, never write to it, and read it only when a
person asks about the earlier work. To go back, switch again, or move the paths
`ARCHIVE.md` lists to their places by hand.

The agent files carry **no frontmatter**. Claude Code's `name`/`description`/
`tools` header is added when ADE projects them into `.claude/agents/`; every
other provider reads the body as-is. That is the whole point of keeping them
here rather than in `.claude/`.

## Using it

Vendor it into a project at a pinned ref, the way `.bmad-core/` is vendored:

```json
{ "agentConfig": { "repo": "git@github.com:alvin-reyes/ade-setup.git", "ref": "v1" } }
```

A teammate who clones the project gets the agents without needing access to
this repo, and the pin is a reviewable line in a pull request.

**A file that already exists is never overwritten.** Hand edits in a project
survive re-vendoring; re-pinning to a new ref reports what it would change
rather than silently replacing your work.

## The roles

| role | owns | notes |
|---|---|---|
| `product-manager` | `docs/prd.md` | requirements and scope |
| `architect` | `docs/architecture.md`, the standards | defines the **verification command** |
| `designer` | `docs/ux-spec.md`, `docs/mockup.html` | real rendered screens, every state |
| `scrum-master` | `docs/stories/` | shards the approved plan |
| `developer` | `src/**` | test-first; never decides Done |
| `qa` | the verdict | writes only the story's Verification section and the journal |
| `devops` | `docs/ops.md` | CI/CD, environments, rollback |
| `adversarial-reviewer` | `docs/reviews/**` | read-only by design; reports, never repairs |

Two guarantees hold the methodology together: **a story is Done only when the
agreed verification command passes**, and **no agent certifies its own work**.
The adversarial reviewer ships with a read-only tool allowlist so that second
one is enforced rather than merely requested.

## Licence

MIT — see [LICENSE](LICENSE). Fork these definitions, change them, ship your own
set; [ADE](https://github.com/alvin-reyes/better-agentic-ide) is MIT too.

These files are the source ADE parses: its role catalog holds no prose of its
own, and it vendors a pinned copy of this repository. Improve a role here and it
reaches a project when someone chooses to update it — nothing pulls
automatically, and a project's own `.ade/knowledge/` is never touched by an
update.
