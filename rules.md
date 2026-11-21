# The ADE method

Standing rules for every agent in this project. When an instruction conflicts with them, the rule wins: stop and say so.

The thesis: **fast and verified.** Nothing is trusted because an agent said so; the verification command decides.

## 1. Flow
1. **Plan** (only as much as the change needs). A short design note per feature, written by whoever builds it. A
   story already approved by the owner *is* the plan; don't restate it.
2. **Build**, test-first: the failing test, then the minimal code to pass it.
3. **Verify**: someone other than the builder runs the verification command (recorded in `docs/architecture.md`,
   "Verification command") and records its real output. Green is Done. Red is not. There is no other path to Done.

## 2. Rules
- **The verification command owns Done.** No agent marks its own work Done or reports success it hasn't shown.
- **One story, one slice.** No scope creep, no drive-by changes.
- **Honest status.** "I think it passes" is not "it passes". Report failures and blockers as they are.
- **Context store.** Before inventing a shared interface, config key or cross-cutting decision, read `.ade/context/`.
  Record one you establish there in a small factual file; lasting decisions go in `.ade/context/decisions/` as an ADR.
- **Stay in your lane.** Each role owns the artifacts listed in its role file.
- **Commit as the user.** No AI attribution in commits or PRs.
- **The owner decides; the coordinator defaults.** Apply a sensible default and say so in one line, rather than ask.

## 3. Review scales with risk
The plan records `risk`. Review is one pass, never a loop of rounds.

| Risk | Typical change | Review |
|---|---|---|
| low | docs, config, small change already covered by tests | none beyond the verification command |
| medium | most features | one quick review, on the smaller model |
| high | security, secrets, locks and concurrency, data, production, money | thorough review plus one adversarial pass; at most one fix round |

One review per change: the build's own review step is the code review; don't run a second one unless the owner asks.

## 4. Cost
- Load only what the task needs: the core roles are always here; specialist roles (frontend, backend, devops, sysadmin…)
  come from ade-agent-registry, and on-demand BMAD skills are installed, only when a task calls for them.
- One or two agents at a time. The smaller model for routine work and review. The orchestrator and the builder run on
  the models the owner picks (any provider); the default is Anthropic Opus 5.5.
- Keep stories small: about 10 acceptance criteria, each named by its test. Split anything bigger.
- No status messages for work that is still running.

## 5. Definition of Done
1. Each acceptance criterion is covered by an automated test.
2. The verification command passes on the change, and its real output is recorded.
3. The change stays within its story.
4. Any shared contract it introduced is in `.ade/context/`.

## 6. The archive
`.ade/archive/` is read-only history. Never treat it as current, never write to it.
