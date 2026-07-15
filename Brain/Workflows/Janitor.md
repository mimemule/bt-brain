# Workflow: Janitor (daily, mechanical only)

The vault's daily maintenance route. **The Janitor automates the janitor, never the editor**: it performs only mechanical moves and consistency fixes whose correctness is decidable without judgment, and *flags* everything else. It never edits note content, never resolves anything requiring interpretation, and never touches engine or reference files.

## Procedure

1. **Conflict scan (first, always)** — glob `Brain/` for `*conflict*` / `* copy*` files (sync forks). Any hit: **stop all other actions and report immediately** — a forked file is silent memory loss and every other step risks compounding it.
2. **Inbox hygiene** — for files in `Brain/Now/Inbox/` older than 7 days:
   - processed captures and processed digests → move to `Now/Inbox/Archive/YYYY-MM/`, and move their `_Index.md` entry from **Current** to **Archived** (update the link path)
   - **unprocessed captures → flag in the report, do not move** (see [[Capture]] aging rules)
3. **Completed sweep** — checked-off tasks older than the current week (in `Now/Tasks.md` **and** dossier Open actions) → `Now/Archive/Completed-YYYY.md` (dated sections, newest first).
4. **Session archiving** — `Sessions/` files older than ~14 days → `Sessions/Archive/` (their `index.md` lines stay put).
5. **Index consistency** — any Inbox file missing its `_Index.md` line → add the line; any past-week Session file missing an `index.md` line → **flag** (writing it needs content judgment; that's Weekly Review's job).
6. **Budget watch** — measure hot-path file sizes against [[Governance]] §2; report breaches, **never trim content**.

## Reporting

- Always end with a `git commit` of the vault, message: `Janitor YYYY-MM-DD: <n> archived, <n> swept, <flags|clean>`. The commit *is* the run record — a missing daily commit means a failed run.
- Write `Brain/Now/Inbox/YYYY-MM-DD Janitor.md` **only when something needs the user's eyes** (conflict files, stale unprocessed captures, budget breaches, missing index lines). A clean day produces no Inbox noise.
