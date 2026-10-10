# Releasing

ADE parses these definitions directly — its role catalog holds no prose of its
own — so this repository is the source of truth for what the agents are, and a
malformed definition is ADE's problem rather than this one's. Releases exist so
a project can pin something legible and know what changed when it moves.

## What happens automatically

Push to `main` touching shipped content and CI will validate, tag and publish a
release. There is nothing to run by hand.

## How the version is chosen

From what changed in `agents/`, not from commit messages — a convention lapses,
a file list does not, and for a content repository the file list is also what
consumers care about.

| Change | Bump | Why |
|---|---|---|
| A definition removed or renamed | **major** | A project naming that role no longer resolves it |
| A definition added | **minor** | New capability, nothing existing breaks |
| Existing definitions edited | **patch** | Same roles, better wording |

The file list cannot see a change to a section ADE parses by name, such as a
renamed heading. That ships as a patch, so coordinate it with the ADE re-vendor
that reads the new shape, as the v4/v6 split of `## BMAD tasks` was.

## What validation enforces

`scripts/validate.mjs`, run on every pull request and before every release:

- a title, a `## What you own` section whose ownership is **glob bullets rather
  than prose**, and a boundaries section — ADE parses all three, and prose
  ownership silently yields a role that owns nothing
- each definition points at **its own** `.ade/knowledge/<id>.md` and no other
- **no dated entries** — that is the shape a project knowledge write takes, so
  one here means a project's specifics landed in a definition shared by every
  project
- BMAD work sits in `## BMAD tasks (v4)` and `## BMAD tasks (v6)`, never an
  unversioned `## BMAD tasks`: every v4 task named actually ships in
  `bmad/bmad-core/tasks`, and a v6 section names `bmad*` skills and never a v4
  path or `/BMad:tasks:` command (ADE checks the v6 skills against its vendored tree)
- the knowledge template exists and states its boundary against the context store

Run it locally before pushing:

```sh
node scripts/validate.mjs
```

## Consuming a release

Nothing pulls automatically, by design. A project keeps the definitions it was
set up with until someone updates it deliberately, and `.ade/knowledge/` is
never touched by an update — that knowledge belongs to the project, not to this
repository.

```sh
ADE_SETUP_REF=v1.2.0 npm run sync:agents   # in the ADE repo
```
