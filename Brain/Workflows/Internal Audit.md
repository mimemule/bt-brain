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

## KPI scorecard (R-effectiveness)

9. **Scorecard snapshot** — compute the four KPIs below and append one row + a dated row-note to `Brain/Metrics/<year>.md` (schema `rakm-kpi/v1`; create the file/folder from the existing year's header if missing). **The collection pass is read-only over measured fields** — it must never bump `last_updated`/`last_verified` or edit measured content; that separation is the anti-gaming design. Numbers are health signals, not proof of error reduction — no external claims from them until a baseline + 3 monthly rows exist.

| KPI | Measures | Direction of good | Decision it drives | Anti-gaming guardrail |
|---|---|---|---|---|
| **K1 provenance integrity** | `Products/` (excl `_Index`): [V] / [U] / GAP line counts; **decayed-[V]** = files past their verification horizon or `stale: true` | decayed = 0; [U]→[V] only via primary-source citation | any decayed/stale file → [[Compliance Officer]] re-verification before next client use | measurement never writes; step 4 samples [V] citations for resolvability |
| **K2 state freshness** | count of `status: active` dossiers with `last_updated` > 14 days, over total | 0 | flagged dossiers get a catch-up sweep ([[Weekly Review]]) | bumping `last_updated` without a matching Log entry = **NC** under step 5 |
| **K3 enforcement heartbeat** | month's artifacts: Janitor commits n/expected (git log), Internal Audit report present, Compliance Check present, prior Metrics row present | all present | any silent absence → escalate as NC to the user (a run that leaves no artifact failed) | measured **from artifacts only** (git + Inbox files), never from a run's self-report; dailies cross-checked by [[Janitor]] heartbeat |
| **K4 correction events** | entries in `Metrics/Corrections.md`: count, control attribution (human / janitor / internal-audit / compliance-officer / engagement-drift / self), and **unprevented count** (no prevention rule) | count itself is direction-ambiguous (detection vs quality — say so in the row note); **unprevented = 0** is the target | every correction without a prevention rule → propose one | log is written at session-closeout, not at metric time; audit samples it against Session notes (no self-grading) |

Small-sample caveat: K1/step-4 numbers ride on ~10-line samples — treat month-over-month deltas < the sample size as noise, and say so in the row note rather than narrating a trend.

`Metrics/Corrections.md` convention (schema `rakm-corrections/v1`, append-only, newest first): one dated entry per wrong fact or inference caught — what was wrong → which control caught it → prevention rule link (or `none — rationale`). The session-closeout routine is the automatic collection point.

## Findings and report

Write `Brain/Now/Inbox/YYYY-MM-DD Internal Audit.md`:

- **NC (nonconformity)** — a documented rule was broken; cite the rule and the evidence. Propose the correction as an explicit old→new diff.
- **OFI (opportunity for improvement)** — practice conforms but a better rule/mechanism is visible.
- Per finding: evidence · rule cited · proposed action · owner (user vs mechanical).
- Close with a conformance summary (areas sampled, clean/NC/OFI counts) and the follow-up list for next month.

Only mechanical corrections (index lines, archiving misses) may be fixed during the audit itself; everything else waits for the user's confirmation. `git commit` the vault after the report. A run that produces no report is a failed run.
