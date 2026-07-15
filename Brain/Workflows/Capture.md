# Workflow: Capture

Read when the user wants to keep something for later — a link, article, idea, observation — that isn't yet part of any engagement or task. The capture lane exists to kill the collector's fallacy: **nothing enters the permanent tiers unprocessed, and nothing unprocessed is allowed to rot silently.**

## Capturing

1. Write the raw capture to `Brain/Now/Inbox/YYYY-MM-DD Capture - <short-slug>.md` with frontmatter: `type: capture`, `processed: false`, `source:` (URL or origin), and the raw content or a faithful summary of it.
2. Add a processing entry to `Brain/Now/Tasks.md`: `- [ ] Process capture: [[YYYY-MM-DD Capture - <slug>]]` — the capture is now visible on the single pending-work surface.
3. Prepend a link in the **Current** section of `Brain/Now/Inbox/_Index.md`, like any Inbox arrival.

## Processing (clearing the entry)

Processing means **distilling the content into its owning tier** per [[Governance]] §1 — a `Research/` finding, a dossier Log entry, a playbook Insight, a task, a Decision, a People encounter — with the capture file never serving as the permanent home. Then:

1. Set `processed: true` and add `routed_to:` links in the capture's frontmatter (where did the value go).
2. Tick the Tasks.md entry.
3. The capture file stays in Inbox as a processing record until the weekly sweep archives it.

If, on processing, the content turns out not to be worth keeping: say so, set `processed: true` with `routed_to: discarded — <one-line reason>`, and tick the entry. A conscious discard is a valid outcome; an unprocessed lingerer is not.

## Aging rules

- **Processed captures** older than 7 days are archived by the weekly sweep (Weekly Review / Janitor) to `Now/Inbox/Archive/YYYY-MM/`.
- **Unprocessed captures** older than 7 days are **flagged loudly** (Janitor daily, Weekly Review backstop) — never silently archived. Silent archiving of unprocessed material is the note-graveyard anti-pattern this lane exists to prevent. The user processes or consciously discards; the system never decides for them.
