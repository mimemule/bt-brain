# Workflow: Catch-Up Digest (extended absence)

Read when the user returns from a holiday or extended absence and asks to be caught up.

1. Ask for the start and end date if not specified (default: from the day after the last digest file in `Brain/Now/Inbox/` to yesterday)
2. Read mail and calendar (via the user's work connector) for the full date range in the user's timezone
3. Apply the same filter rules as the daily digest (discard newsletters, automated notifications, etc.)
4. Produce one digest block per day, most recent first — same format as the daily digest
5. Collapse days with no actionable content to a single "No actionable activity." line
6. Append a single consolidated open actions list at the end, dated by source day
7. Write the output as a single file: `Brain/Now/Inbox/[start-date] to [end-date] Catch-Up Digest.md`
8. Then process it per [[Digest Processing]]
