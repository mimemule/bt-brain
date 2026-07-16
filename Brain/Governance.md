# Vault Governance

Rules that keep the vault from drifting and bloating. Not in the session hot path — read this **before any structural change to the vault** (moving, renaming, or re-architecting files/folders), and during the closeout health check.

## 1. Canonical ownership — one fact, one home

Every category of fact has exactly one owner file. Everywhere else: link, don't restate. A restated fact is a future drift.

| Fact category | Owner (single source of truth) |
|---|---|
| Vault structure + hot path | `Brain/README.md` |
| The user's profile, setup, preferences | `Brain/<Name>.md` |
| Firm/team context | `Brain/Firm.md` |
| Behavioral rules for Claude | `Brain/Instructions.md` + `Brain/Standing_Instructions.md` |
| Workflow procedures | `Brain/Workflows/[workflow].md` |
| Client state (profile, stage, contacts, history) | `Brain/Clients/[client].md` — `stage` frontmatter is *the* status field |
| Open client tasks | The client's dossier **Open actions** section — nowhere else (no mirroring into Tasks.md) |
| Open non-client tasks + Waiting On | `Brain/Now/Tasks.md` |
| Live task/client views | Query blocks embedded in `Brain/Now/Tasks.md` and `Clients/_Index.md` — **derived, never hand-edited with facts** |
| Decisions | `Brain/Decisions/[year].md` |
| Engagement know-how (procedure) | `Brain/Playbooks/` |
| Reusable research findings | `Brain/Research/` — classified via `Research/_Index.md`; projects **cite**, never restate |
| Domain reference facts | `Brain/Products/[domain].md` — provenance tags per `Products/_Index.md` |
| Cross-client people (relationships, encounter history) | `Brain/People/[person].md` — encounters append-only; linked from dossiers, never restated in them |
| Vault rules (this) | `Brain/Governance.md` |

Index tables derived from frontmatter (e.g. via Dataview) cannot drift — never re-add hand-maintained status columns beside them.

## 2. Anti-bloat — size budgets on the hot path

The hot path is only cheap if its members stay small. Budgets (bytes on disk):

| File | Budget | When exceeded |
|---|---|---|
| `<Name>.md` (profile) | 3 KB | Move detail to the owning dossier/project doc; keep the pointer |
| `Firm.md` | 4 KB | Same |
| `Instructions.md` | 5.5 KB | Move procedure bodies to `Workflows/`; keep one trigger line |
| `Standing_Instructions.md` | 4 KB | Consolidate; safeguards should be principles, not case law |
| `Now/Tasks.md` | 8 KB | Move Completed to `Now/Archive/`; compress long task notes into the dossier and link |
| Latest `Sessions/` file | 6 KB | Fine to exceed on a heavy day; archive per weekly review |

Placement rule for any new standing content: **"Will every future session need this?"** If not, it does not go in a hot-path file — it goes in `Workflows/`, a dossier, a playbook, or `Governance.md`, with at most a one-line trigger pointer in `Instructions.md`.

**Budgets are policy, not physics — growth is routed, never forbidden.** Total knowledge grows without limit in the linked tiers; the budget only caps what every session loads unconditionally. When a file hits its budget, escalate in order:

1. **Placement first** — most budget pressure is misplaced content. Relocate to the owning file with a link; relocation is lossless.
2. **Flow files are different** — `Tasks.md` and Sessions files shrink by archiving; budget pressure there signals a process backlog, not growth.
3. **Raise the budget deliberately** — if content genuinely passes the every-session test, increase the budget and log it in `Decisions/` with the rationale. The cap exists to force a conscious decision, not to prevent one.
4. **Headroom check** — the whole hot path is a few thousand tokens against a context window orders of magnitude larger. Budgets keep session start cheap and attention focused; never let a budget justify deleting real knowledge.

## 3. Pointer registry — external things that hardcode vault paths

Things living *outside* the vault will NOT auto-update when vault files move. Any structural change must check every row; update this table when a consumer is added or retired. Populate with your own consumers — typical examples:

| Consumer | Location | Paths it hardcodes |
|---|---|---|
| Global Claude standing instructions | `~/.claude/CLAUDE.md` | hot-path pointer, `Brain/Clients/` |
| Each Claude Code skill that touches the vault | `.claude/skills/<skill>/SKILL.md` | whatever paths it reads/writes |
| Scheduled tasks / cloud routines | wherever they're defined | the files they write into `Brain/Now/Inbox/` |
| Engine repo + distribution camera | the engine remote + its ignore/whitelist rules | every §7 engine path |
| Obsidian MCP plugin config | `.obsidian/` (vault root binding) | vault root path itself |

**Verification after any structural change** — grep the old path across all consumers, then watch the next scheduled write and confirm output lands in the new location. A stale writer silently recreates orphan folders — that failure mode is invisible until checked.

## 4. Change protocol for structural moves

1. `git commit` the vault (clean baseline) before touching anything
2. Copy or move; if moving via MCP/file tools, note wikilinks do NOT auto-update (only Obsidian UI moves do) — grep the vault for `[[old name]]` and old paths, fix all
3. Sweep the pointer registry (§3) and update every consumer in the same session
4. Run the verification grep + watch the next automated write
5. `git commit` the completed change; never leave a structural change uncommitted overnight

## 5. Automated enforcement (not dependent on the user's discipline)

- **Closeout health check** — run a governance check at every session close: hot-path size budgets, drift greps, Completed-section buildup in Tasks.md, and a git commit.
- **Janitor** — `Workflows/Janitor.md`, daily, **mechanical only**: archiving sweeps, index consistency, conflict detection, budget watch. Automates the janitor, never the editor — anything needing judgment is flagged, not fixed.
- **Weekly review** — `Workflows/Weekly Review.md` includes the same sweep plus stale-dossier and index checks; it is the backstop, not the primary control.
- **Internal audit** — `Workflows/Internal Audit.md`, monthly, sampling-based conformance audit of practice against these rules (ISO-style NC/OFI findings, prior-findings follow-up, report-only). Complements the Compliance Officer, which verifies external truth. Also appends the monthly **R-effectiveness KPI scorecard** row to `Brain/Metrics/<year>.md` (definitions + guardrails in the workflow; collection is read-only over measured fields; Janitor step 7 is the external heartbeat for silent run failures).
- **git** — the vault is a git repo. Recovery: `git log` / `git diff` / `git checkout <commit> -- <file>`. An auto-commit plugin (e.g. obsidian-git on an interval) gives zero-discipline snapshots.

## 6. Known tool hazards

- **Heading-replace patches** can corrupt headings in some Obsidian MCP implementations. Prefer `append`; for replacements, read-then-write the whole file, and verify with `git diff` after any patch.
- **Concurrent writers:** Obsidian, MCP tools, and any scheduled routine may write into a cloud-synced folder. If a `*-conflict` or "copy" file ever appears in `Brain/`, stop and reconcile immediately — a forked Tasks.md is silent memory loss.
- **Strings that parse as tags:** tokens like `#08-07` (unit numbers, issue refs) parse as Obsidian tags — backtick them in vault notes.

## 7. Distribution — engine/state boundary

The vault is one person's instance of a distributable system: a **maintainer** authors the engine; **members** receive it and every future improvement over `git pull`, while their own work is never touched. Distribution is only safe because engine and personal state are cleanly separated.

**Split by what the folder is *for*, not one blanket lock:**

- **Locked engine** — the behavioral/procedural spine that must never fork or the system stops behaving consistently. Ships **read-only**, **force-reset on update**; local edits are discarded, and that discard is what keeps updates conflict-free. The lock *is* the update mechanism.
- **Contributable engine** — knowledge bases where field additions add value (facts, findings). Ships editable; syncs by **merge, not reset**, so a member's additions survive the pull and are proposed upstream. Classifying test: *facts/findings accumulate* → contributable; *behavior/procedure is authored* → locked.
- **Scaffolded-empty** — install creates the *slot* but ships no content; the member owns the fill (profile, firm note, decision log).
- **State** — member-owned, **never touched** by any update. Anything not listed as engine is state by default.

The concrete classification lives in `.brain/manifest.yml` — the machine-readable form of this section, parsed by the install and update scripts.

**Flow.** The locked spine is one-way: the maintainer authors, members consume. Contributable folders are two-way but **curated**: a member's local addition persists for them, is pushed to their own private fork by the update script, and reaches canonical only through the maintainer's review and merge — whence it redistributes to everyone on the next pull.

**Access model.** Members are **read-only** on the engine repo — the canonical branch is physically unpushable by anyone but the maintainer, with no reliance on paid branch-protection features. Contributions travel via private forks in members' **personal namespaces** (org-owned upstreams retain admin over such forks; forks created inside another org escape that control — require personal-namespace forks).

**Two-camera authoring (maintainer option).** The maintainer's own vault can serve both as their working brain and the engine source by running two independent git databases over one working tree: the default `.git` as a full-vault personal backup, and a second git-dir (e.g. `.git-engine`) whose whitelist (`info/exclude`) admits only engine paths. Engine pushes are then deliberate acts (`git --git-dir=.git-engine …`), and no tracked root `.gitignore` is possible — a tracked one would be read by *both* cameras and silently stop the backup from capturing new state files. Members instead get a `.gitignore` **generated at install** from the manifest.

**Update mechanism.** Install fans the engine out and scaffolds the member's slots; update force-resets locked paths, merges contributable paths, auto-commits and proposes contributions, and cannot touch state. The engine ships as an **integral package** — the whole engine or none of it; partial adoption breaks system integrity. "Integral" governs *install*; "updatable" governs *maintenance* — both hold at once.
