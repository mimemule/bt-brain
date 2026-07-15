# Products — Domain Reference Facts

One file per domain / service line your team delivers: mechanics, official requirements, checklists, cadences. **Facts only — procedure lives in `Playbooks/` and skills.** These files are the fact source that domain skills read at runtime (skills carry procedure, references carry facts). Write them client-safe by structure: everything internal sits under an `Internal delivery notes` heading, so a client-facing rendering is a section filter, not a rewrite.

## Provenance tags — load-bearing for small models

Every fact line carries one of:

- **[V]** — verified from a primary source (official document, live folder/file, the domain owner directly). Safe to use in deliverables.
- **[U]** — general knowledge, not yet verified against current official sources. **Confirm before any client-facing use.**
- **GAP:** — known missing; needs extraction from the domain owner or engagement records.

A skill reading these files must never put a [U] fact or a GAP into a client deliverable without verification. Promotion [U]→[V] requires citing a **primary source** — an official document, a live folder/file, or the domain owner — never another vault file (circular verification), and updating `last_verified` in frontmatter.

## Verification decay

[V] is not permanent — verification decays. Category horizons (tune to your domains):

| Fact category | Horizon |
|---|---|
| External scheme/regulatory facts (rules, validity, scope, cadence) | 12 months from `last_verified` |
| Edition/version facts (current edition, transition deadlines) | 6 months |
| Internal referents (paths, filenames, sheet names) | checked on every engagement touch + every compliance run |
| Judgment norms (evidence-acceptance rulings) | no timer — flagged only via Drift logs |

- Past horizon → the [[Compliance Officer]] workflow sets `stale: true` in the file's frontmatter; a stale file's facts are **all** treated as [U] until re-verified. Fail-safe direction: staleness blocks client use loudly, never steers silently.
- Every skill run that observes a reference-vs-reality discrepancy (a source said X, the reference said Y; a file not where stated) appends it to that reference file's `## Drift log` section — engagements double as drift sensors.
- Maintenance owner: the [[Compliance Officer]] workflow — agentic by design; no human owner is required.

## Files

| File | Status |
|---|---|
| *(one per domain you deliver)* | skeleton / partial / verified |

Status ladder: `skeleton` (structure + tagged general knowledge) → `partial` (some [V] facts) → `verified` (all load-bearing facts [V], gaps closed). Population happens progressively — each domain-skill build session promotes its reference.
