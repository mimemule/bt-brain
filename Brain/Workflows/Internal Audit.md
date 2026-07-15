# Workflow: Internal Audit (monthly, rigorous)

The brain's conformance audit: **does practice match the documented system?** More rigorous than [[Weekly Review]] (which catches drift), complementary to [[Compliance Officer]] (which verifies external truth) and [[Janitor]] (which does mechanics). The Internal Audit samples actual behaviour against the vault's own rules and reports findings ISO-style. Report-only: it proposes, never commits non-mechanical fixes.

## Procedure (sampling-based — depth over coverage)

1. **Prior-findings follow-up** — read the previous Internal Audit report (Inbox or its archive). Every open NC: verify closed or escalate as repeat-NC. An audit trail that doesn't follow up isn't one.
2. **Ownership conformance** — sample ~10 notes across tiers; check one-fact-one-home (Governance §1): restated facts, hand-edited derived views, content violating the placement rule.
3. **Carry conformance** — sample 2 processed digests from the month; re-verify every actionable item landed across all three buckets ([[Digest Processing]]) — the deep version of Weekly Review's reconciliation.
4. **Provenance conformance** — sample ~10 fact lines across `Products/`; check tags present, [V] lines carry resolvable citations, `last_verified` within horizon, no [U] facts visible in any recent client-facing output sampled.
5. **Log integrity** — spot-check dossier Logs and `Decisions/` for append-only, dated, newest-first discipline.
6. **Pointer-registry full verification** — every Governance §3 row: grep the consumer for its hardcoded paths; confirm scheduled writers actually wrote within their cadence (silent absence = finding).
7. **Workflow conformance** — pick one workflow (rotate monthly); audit its most recent execution evidence against its spec, step by step.
8. **Distribution integrity** (instances that distribute an engine) — engine tree clean; whitelist/manifest agree; no state or secrets in the engine repo (sample grep); backup mechanism shows recent activity.

## Findings and report

Write `Brain/Now/Inbox/YYYY-MM-DD Internal Audit.md`:

- **NC (nonconformity)** — a documented rule was broken; cite the rule and the evidence. Propose the correction as an explicit old→new diff.
- **OFI (opportunity for improvement)** — practice conforms but a better rule/mechanism is visible.
- Per finding: evidence · rule cited · proposed action · owner (user vs mechanical).
- Close with a conformance summary (areas sampled, clean/NC/OFI counts) and the follow-up list for next month.

Only mechanical corrections (index lines, archiving misses) may be fixed during the audit itself; everything else waits for the user's confirmation. `git commit` the vault after the report. A run that produces no report is a failed run.
