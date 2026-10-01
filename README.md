# ade-setup

Shared ADE agent configuration: the role definitions and the methodology, in a
form any provider can read.

ADE generates this into every project it opens. Keeping it in one repo means a
change to a role reaches every project that vendors it, instead of being frozen
at whatever the generator wrote the day the project was created.

## What's here

```
agents/<name>.md    the eight core roles, provider-neutral Markdown
rules.md            the ADE methodology: Plan → Approve → Shard → Build → Verify
standards.md        the project's coding standards (the architect fills this in)
context/            templates for the context store and the decision log
ade.json            which ADE version produced this
```

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
