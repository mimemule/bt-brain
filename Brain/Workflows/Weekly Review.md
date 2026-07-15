# Workflow: Weekly Review

Read when the user says "run weekly review" (typically Friday). This is the **backstop** sweep — the session-closeout health check is the primary drift control (see [[Governance]] §5).

**Priority: drift-detection first.** Steps 3 and 6 (frontmatter sync, governance sweep) are the point of this review — find where the vault has drifted from its own rules and fix it directly. Steps 2 and 5 (chase-ups, synthesis candidates) are secondary — surface them briefly in the summary but don't invest effort drafting emails or writing Insights unless the user asks for it that session. *Exception:* the missed-carry reconciliation in step 2 **is** drift-detection — fix it directly.

1. **Stale dossiers** — list clients in `Brain/Clients/` with frontmatter `last_updated` older than 14 days; for each, check recent digests for missed activity, else flag as "no movement — confirm still active?"
2. **Waiting On + carry sweep** — two passes:
   - *Chase-ups (surface only):* flag every existing Waiting On row with no movement since logged. List them — don't draft chase-up emails unless asked.
   - *Missed-carry reconciliation (fix directly — this is drift):* re-scan the past week's digests in `Brain/Now/Inbox/` and confirm every actionable item landed where it belongs, across all three buckets from [[Digest Processing]]: **owed-by-others** → a Waiting On row; **needs-input** → a task; **deadlined** → a task with a due date. For anything still open with no home, create it now.
3. **Frontmatter sync** — verify each dossier's `stage` frontmatter matches its Current engagements section, *and* that Open actions don't duplicate anything owed by others (that belongs only in the Waiting On table, [[Governance]] §1). Fix drift directly, don't just report it.
4. **Session index check** — for any `Brain/Sessions/YYYY-MM-DD.md` from the past week with no matching line in `Brain/Sessions/index.md`, append one — this catches a session that ended without a closeout pass.
5. **Synthesis pass (surface candidates only)** — the weekly recency-windowed backstop for cross-note insight. Do **not** brute-force compare notes — synthesis is *event-anchored and neighbourhood-scoped*. Anchor on what changed this week (the week's Sessions index lines → matching dossier Log entries). For each anchor, fire a synthesis attempt only when the **gate** passes: the anchor changed this week **AND** its neighbourhood (same client, shared tag, or 1–2 hop links) holds ≥2 related notes **AND** at least one trigger fires:
   - **Contradiction** *(highest priority — name it even if nothing else fires):* the change conflicts with a held fact — a client requirement vs. a [[Playbooks]] assumption, a new position vs. a prior Decisions ruling.
   - **Rule of three:** the same motif now appears independently across **≥3 clients/notes**. A Playbook Insight candidate by definition.
   - **Open question:** a task or Waiting On item needs the connection to resolve.

   **Novelty filter** — surface a candidate only if it isn't already captured in `Playbooks/`, `Decisions/`, or `Research/`. **Human gate** — name each surviving candidate in the summary (what connected · which trigger · proposed home). Don't write the Insight/note unless the user confirms it that session. *This is a detect-and-escalate step by design — it never writes synthesis into the vault unattended.*
6. **Governance sweep** — run the [[Governance]] checks: hot-path size budgets (§2), pointer-registry drift greps (§3), and confirm no `*-conflict` files exist in `Brain/`. Fix what you find rather than only flagging it.
7. **Housekeeping** (backstop for the daily [[Janitor]] — verify it ran this week via git log, then catch what it missed) —
   - move checked items older than the current week (in Tasks.md **and** dossier Open actions) into `Brain/Now/Archive/Completed-YYYY.md`
   - sweep **all Inbox entries older than 7 days** into `Brain/Now/Inbox/Archive/YYYY-MM/` — except unprocessed captures, which are **flagged, never silently archived** ([[Capture]] aging rules); Sessions files older than ~14 days to `Sessions/Archive/`
   - when an Inbox file moves, also move its `_Index.md` entry from **Current** to **Archived**, updating the link path
   - when a Session file archives, its `index.md` line stays put — the index is the permanent lightweight record
   - `git commit` the vault at the end of the review
8. Output a short review summary; write flagged actions into Tasks.md only after the user confirms
