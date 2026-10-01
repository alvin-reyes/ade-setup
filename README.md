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
bmad/               vendored BMAD-METHOD: bmad-core/ and the /BMad: commands
ade.json            which ADE version produced this
```

`agents/` holds the eight methodology roles plus six more the agent picker
offers — analyst, UX expert, product owner, brainstorming architect, technical
writer and advisor. The picker's `dev` is the same job as `developer` and is not
duplicated here.

`claude/` is the same eight roles with Claude Code's `name`/`description`/
`tools` frontmatter, plus the `CLAUDE.md` constitution. Copy it in when you want
Claude Code's sub-agent delegation; every other provider reads `agents/`.

`bmad/` is a pinned copy of [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
— `bmad-core/` and the `/BMad:` slash commands. Nothing is downloaded at setup
time. The ADE rules always win: a BMAD task can never override the verification
command, the Definition of Done, or the constitution.

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
