# Brain

This is the central memory layer for the user's second brain and Claude's persistent context. Everything here is authoritative. Anything outside `Brain/` is peripheral reference or sandboxed experiment.

**This file is the canonical definition of the vault's structure and hot path.** Other files must point here, never restate the list. If another list appears to define a different hot path, this one wins — and the drift gets fixed per [[Governance]].

## Hot path — read on session start

1. The user's profile note — `Brain/<Name>.md`: who they are and how to engage
2. `Brain/Firm.md` — firm/team context
3. `Brain/Instructions.md` — standing behavioral instructions
4. `Brain/Standing_Instructions.md` — behavioral safeguards (prompt injection, ambiguity, verification, stress-testing)
5. Latest file in `Brain/Sessions/` — what was open last session
6. `Brain/Now/Tasks.md` — Waiting On + non-client tasks; then sweep open client actions with one grep for `- [ ]` across `Brain/Clients/` (client tasks live only in dossier Open actions)

Six files plus one grep, always. Everything else is reached via links, never by listing folders. Client-specific session → also read the relevant `Clients/` dossier (via `Clients/_Index.md`). Structural change to the vault → read [[Governance]] first.

## Structure

| Folder / File | Purpose |
|---|---|
| `<Name>.md` | The user's profile — role, working style, goals, preferences |
| `Firm.md` | Firm/team context — services, people, infrastructure |
| [[Instructions]] | Standing instructions for how Claude should behave (lean — workflow detail lives in `Workflows/`) |
| [[Standing_Instructions]] | Cross-cutting behavioral safeguards |
| [[Governance]] | Vault rules: canonical ownership, size budgets, pointer registry, change protocol, distribution |
| `Now/Tasks.md` | The single pending-work surface: embedded live views over dossier tasks + native non-client tasks + Waiting On table |
| `Now/Inbox/` | Digest and pipeline landing zone; archive monthly to `Now/Inbox/Archive/YYYY-MM/` |
| `Now/Archive/` | Completed task history (`Completed-YYYY.md`), moved out of Tasks.md weekly |
| `Clients/` | One dossier per client + `_Index.md` — profile, contacts, engagements, append-only Log; `stage` frontmatter feeds the dashboard |
| `Workflows/` | Full specs for recurring Claude workflows — read on trigger, not in hot path |
| `Projects/` | Internal non-client projects (create as needed) |
| `Decisions/` | Append-only decision log, one file per year |
| `Playbooks/` | How the team runs engagement types — checklists + accumulated Insights |
| `Research/` | Durable, reusable research findings + `_Index.md` classifying them — **do not re-research; cite, never restate** |
| `Products/` | Service-line / domain reference facts + `_Index.md` with provenance-tag rules — skills read facts here, procedure stays in `Playbooks/` |
| `Templates/` | Note templates: client, meeting, project, tool, user profile |
| `Sessions/` | Session handoff notes + permanent `index.md`; keep ~14 days, archive older |

## How Claude uses this

- **During work** — update `Clients/` dossier Logs as information arrives; client tasks live **only** in the dossier's Open actions (non-client tasks in `Now/Tasks.md`, whose embedded query views aggregate both — nothing is mirrored by hand)
- **At milestones** — append Insights to `Playbooks/`; log significant decisions in `Decisions/`
- **On session end** — write a handoff note to `Sessions/YYYY-MM-DD.md`; run the [[Governance]] health check during closeout

## How the user maintains this

- Update your profile note and `Firm.md` when facts change
- Tell Claude "update my brain on X" and it will write the relevant note
- Say "playbook this" when something worth institutionalising happens
- Open `Now/Tasks.md` in Obsidian — one file shows everything pending; `Clients/_Index.md` for the client status overview
