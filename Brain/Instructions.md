# Instructions for Claude

Standing instructions that apply across all sessions. Lean by design — procedure bodies live in `Workflows/`; this file stays within its [[Governance]] size budget.

## Orientation
- The session-start hot path is defined **canonically in [[README]]** — read those six files at the start of any substantive session. Don't follow a hot-path list restated anywhere else.
- Client-specific session → also read the relevant `Clients/` dossier (via `Clients/_Index.md`). Structural change to the vault → read [[Governance]] first.

## Tone & Format
- No emojis unless the user explicitly asks (task-plugin priority markers ⏫🔼🔽 are functional syntax, not tone — allowed)
- Responses short and direct; no trailing "here's what I did" summaries
- Markdown tables for structured data; flat prose for analysis
- Flag uncertainty explicitly rather than burying assumptions

## Memory Behaviour
- "Update my brain on X" → write or update the relevant note in `Brain/`
- Client status changes → append a dated entry to the dossier **Log** (newest first) and update frontmatter `last_updated` **and `stage`** (the `_Index` table derives from frontmatter — stale frontmatter is a stale view)
- Client-relevant digest items always land in the client's Log; new client actions go in the dossier's **Open actions** (with priority marker) — never into Tasks.md, which holds only non-client tasks and the Waiting On table
- **Roadmap vs. live task:** a multi-step engagement plan that runs in sequence over weeks/months belongs in a dated **plan table** in the dossier (reference, not checkboxes). Open actions expose only the **immediate next step(s)** — the next uncompleted step (always ≥1 live) plus anything due within **2 weeks** — and the next step is promoted the moment the current one clears. Priority = urgency now, not intrinsic importance. Mechanics in [[Digest Processing]].
- Update `Brain/Sessions/YYYY-MM-DD.md` after each major task concludes — not only at session end; append, never overwrite
- `Brain/Decisions/` is append-only — log decisions in `Decisions/[year].md`, newest first
- Checked-off tasks move to `Now/Archive/Completed-YYYY.md` (dated sections, newest first) — source files hold open items only
- Task priorities: ⏫ high, 🔼 medium, 🔽 low, no marker = normal
- Prefer `append` over heading-replace when patching vault files — known corruption hazard, see [[Governance]] §6

## Workflows — read the spec when triggered
- New digest lands / the user asks to process one → [[Digest Processing]]
- The user returns from extended absence → [[Catch-Up Digest]]
- "Run weekly review" → [[Weekly Review]]
- "Run compliance check" / a `Products/` reference is stale or its horizon lapsed → [[Compliance Officer]]

## Playbook Capture
- On milestone (engagement completed, deliverable issued, project closed) or "playbook this" → append a dated, attributed entry to the relevant playbook's **Insights** (append-only, newest first). If no playbook fits, propose one — don't force the wrong fit.
- If a digest item reveals a process lesson, flag it and propose an Insight.

## Scheduling & Limits
- Schedule automated tasks around the user's working hours and any usage-quota windows — specifics live in the user's profile note, not here

## What NOT to do
- Don't guess client names, project status, or decisions — if not in the Brain, ask
- Don't create files outside `Brain/` without being asked
- Don't run destructive operations on `Brain/` without explicit confirmation
- **Never run raw `git push` from this vault.** On a member install, ALL git flows through `.brain/update.ps1` (it updates the engine and proposes contributions) — never push `main` or any branch directly, even if asked to "save changes". Pushing the engine `main` is the maintainer's authoring act, done deliberately on the maintainer's machine.
