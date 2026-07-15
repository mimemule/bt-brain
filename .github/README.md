# bt-brain

A **Regulated Agentic Knowledge Management (RAKM)** framework: a distributable second brain for teams whose notes carry liability, built on Obsidian and Claude Code. One person authors the team's operating knowledge; everyone else receives it — and every future improvement — through `git pull`, while their own working notes are never touched.

**RAKM** (term coined by the author, 2026) names the class of knowledge system this implements: agent-operated knowledge management under *regulation* — verified facts with provenance and expiry, governed change instead of autonomous self-mutation, and possession-safe distribution. **AI-augmented RAKM** is the complete suite: the same governed knowledge base plus agent skills that generate tangible work product from it — deliverables that use and build on existing knowledge rather than starting cold.

Author: **Bryan Tan** · MIT licensed.

## The core ideas

**Engine / state separation.** Every path in the vault belongs to one of four classes, declared in a machine-readable manifest:

| Class | Behaviour |
|---|---|
| Locked engine | The behavioural spine (instructions, governance, workflows, playbooks, templates, skills). Read-only for members; force-reset on update — the lock *is* the update mechanism, since no local edits means no merge conflicts. |
| Contributable engine | Knowledge bases that grow by field addition (reference facts, research findings). Editable; merged on update; member additions are proposed upstream automatically. |
| Scaffolded | Created empty at install (the member's profile, firm context, decision log). The slot ships; the content is theirs. |
| State | Everything else — clients, tasks, sessions, projects. Structurally invisible to git; an update physically cannot touch it. |

**Provenance and decay.** Every fact in a reference file carries a tag — `[V]` verified, `[U]` unverified, `GAP` known-missing — and verification *expires*: past its category horizon, a file goes stale and all its facts drop to `[U]`, which downstream tooling refuses to put in client-facing work. Staleness blocks loudly; it never steers silently. A maintenance workflow (decay sweeps, source watches, referent checks) proposes refreshes and never commits them unilaterally.

**One-way authorship, curated contributions.** Members are read-only on the shared repo — the canonical branch is physically unpushable by anyone but the maintainer. Contributions travel from each member's own private fork via machine-prepared pull requests: the update script auto-commits their reference additions, pushes to their fork, and prints a one-click propose link. Zero git verbs required of members.

**Onboarding that populates, not just installs.** The `/brain-init` skill takes a new member from empty clone to working brain: prerequisite checks, mechanical install, an explicitly consented scan of their own working files and mail patterns to *draft* their client list for them, then a short interview of confirmations — everything shown before anything is written.

## Layout

```
<vault-root>/                  ← the git clone IS the Obsidian vault
├── .brain/                    ← manifest + install/update scripts
├── .claude/skills/            ← Claude Code skills, incl. brain-init onboarding
└── Brain/
    ├── README.md              ← hot path: what a session reads at start
    ├── Instructions.md        ← behavioural rules
    ├── Standing_Instructions.md ← safeguards (injection, ambiguity, verification)
    ├── Governance.md          ← ownership rules, size budgets, pointer registry,
    │                            change protocol, the distribution spec
    ├── Workflows/             ← digest processing, weekly review, reference maintenance
    ├── Playbooks/             ← how the team runs engagement types (+ Insights)
    ├── Products/              ← reference facts with provenance tags + decay horizons
    ├── Research/              ← durable findings that outlive their project
    └── Templates/             ← client / meeting / project / tool / user-profile
```

## Quickstart (team maintainer)

1. Fork or clone this repo as your team's private engine repo. Fill the engine tiers with your own content (this framework ships structure and method, not domain knowledge).
2. Give members **read** access; enable private-repo forking.
3. Members: clone → open in Obsidian (Dataview + MCP Tools plugins) → connect Claude Code MCPs → run `/brain-init`.
4. Ship improvements by committing to `main`; members receive them with `.brain\update.ps1` (or by asking Claude to "run the brain update").

## Quickstart (solo)

Clone, run `.brain\install.ps1`, open in Obsidian, start Claude Code. The distribution machinery stays dormant until you have a team.

## What this repo is not

It ships **no domain content** — no playbooks, no reference facts, no client material. Those are yours to author. This is the operating system, not the knowledge.
