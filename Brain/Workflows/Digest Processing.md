# Workflow: Digest Processing

Read when a digest lands or the user asks to process one.

## The loop
- Generation + processing run together as one manual pass — the user triggers it when they sit down to review, so flagged items get their eyes. (Lesson learned: unattended scheduled digests window coverage badly, fire unreliably, and drop unprocessed files into the Inbox — keep the human in the loop.)
- Digest output lands in `Brain/Now/Inbox/` (dated files: `YYYY-MM-DD Daily Digest.md`)
- Whenever a new digest file is written, prepend a link to it at the top of the **Current** section in `Brain/Now/Inbox/_Index.md` — this keeps digests newest-first independent of file-explorer sort order

## Processing a digest
1. Extract client-relevant items → append to the corresponding `Brain/Clients/` dossier Log (always the Log, not only Tasks.md)
2. **Waiting On sweep** (mandatory — see below): scan the *whole digest prose* for anything owed by an external party, and reconcile it against the Waiting On table
3. Carry new actions to their owner ([[Governance]] §1) — see **Carry rules** below. Every actionable line lands *somewhere*; nothing is left only in the digest file.
4. **End-of-digest reconciliation** (mandatory — see below): report the tally to the user across all three buckets before declaring the digest processed

## Waiting On sweep (step 2 — do not skip)
The failure mode this guards against: a dependency written in prose — "still awaiting the last two deliverables before the certificate can be reissued" — gets dismissed with "already tracked in dossier, no new open action needed", never becomes a Waiting On row, and is forgotten.

- Read every client block and the Open Actions section as prose. Flag any sentence containing dependency/waiting language (case-insensitive): *awaiting, await, waiting on/for, pending, still need, yet to receive, haven't received, outstanding, before we can / until … (arrives / is signed / received), once … received, gates, chasing, owed, expecting, to be provided/sent/shared/returned by, reverting, will get back*.
- For **each** flagged item, name it explicitly: **who owes it · what (itemise — "2 deliverables" is not acceptable; open the source email/thread and list them) · since when · what it gates**.
- Reconcile against the Waiting On table in `Brain/Now/Tasks.md`:
  - Item has **arrived** per the digest → clear the existing row (or don't create one).
  - Item is **still outstanding** and a row exists → leave it; refresh Since/Notes if the situation changed.
  - Item is **still outstanding** and no row exists → **create the row.** No exceptions.
  - Row exists but the item has gone **quiet past its window** → flag as a chase-up.
- **Hard rule:** "It's already in the dossier Log / Open actions" does **not** exempt an outstanding external dependency from a Waiting On row. Dossier Logs are narrative history; the Waiting On table is the live chase surface. An item owed by an outside party lives in **both**.

## Carry rules (step 3)
- Read the digest file first and check checkbox state — only carry items still marked `[ ]`. Items already `[x]` go straight to `Brain/Now/Archive/Completed-YYYY.md` under today's date.
- **Route by owner:** client actions → the dossier's **Open actions** (with priority marker); non-client actions → Tasks.md; owed by others → the Waiting On table.
- **⚠️ Needs-input items always land in Tasks.md (or the dossier for client matters) — never left as FYI.** Any `⚠️ Needs input:` line **must** become a task, carrying the prefix so it stays visible. (Failure mode: a needs-input item due the same day surfaced in a digest and was never carried.)
- **Deadlines are load-bearing.** If a digest item names or implies a date — "today", "by Friday", "before the meeting" — attach a due date `📅 YYYY-MM-DD` and a priority marker: **⏫ if due within ~2 days**, 🔼 if this week. Don't drop urgency because the phrasing was casual.
- **Roadmap vs. live task (sequential engagements).** When a dossier holds a multi-step plan running over weeks/months, keep the full plan in a dated **plan table** (reference, *not* checkboxes) and expose as Open-action tasks only: **(a)** the next uncompleted step (always at least one live), plus **(b)** any plan item due within the **next 2 weeks**. On completion of a live step, immediately promote the next plan step. Never dump the whole plan into Open actions as standing tasks — priority markers reflect **urgency now, not a milestone's intrinsic importance**. (Failure mode: six sequential future activities all written as high-priority open checkboxes flooded the task surface as if all due immediately.)
- **Each digest run, enforce the above:** for every engagement with a plan table, confirm the live Open actions still hold the next step + any item now inside the 2-week window.

## End-of-digest reconciliation (step 4 — report to the user)
Before saying the digest is processed, output a short tally so nothing drops silently. Three buckets:
- **Owed by others (Waiting On):** phrases detected N → rows created / cleared / flagged for chase-up / deliberately-not-rowed-with-reason.
- **⚠️ Needs input:** count in digest → count now in Tasks.md/dossiers. These must match.
- **Deadlined actions:** every item with a date → confirm each carried with a `📅` due date + priority.
If any bucket shows items detected but none created/cleared/explained, **stop — something was dropped. Re-run.**
