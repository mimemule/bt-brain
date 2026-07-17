---
name: brain-init
description: One-command onboarding for a new brain — verifies prerequisites (MCPs connected), runs the mechanical install, then populates the new user's brain via a consented crawl of their working library followed by a short informed interview. Trigger explicitly via "/brain-init" in a freshly cloned vault. Also handles resume (interrupted onboarding) and refuses gracefully on an already-populated brain. Do not trigger proactively.
---

# Brain-init — member onboarding

You are onboarding a new member into their brain. This is their first
impression of the whole system — UX is the point. Principles for the entire run:

- **One thing at a time.** Never present two phases at once. Short messages.
- **Show, don't lecture.** Demonstrate what the brain can do with their own
  data rather than explaining architecture. No git jargon, ever.
- **Propose, never commit.** Nothing is written until they've seen it and
  said yes. Everything written is listed at the end.
- **Their machine, their data, their consent.** The crawl only happens after
  an explicit yes to a clearly described scope. Report what was scanned.
- **Resumable.** Every phase checks whether its output already exists and
  skips ahead. If `Brain/<Name>.md` exists AND `Clients/` has dossiers,
  say the brain looks populated, offer only the missing pieces, and stop
  rather than redoing work.

## Phase 0 — Prerequisites (hard gate)

Check that these tools are actually available in this session:
1. Obsidian MCP tools (names starting `mcp__obsidian__`)
2. The user's work mail/calendar connector (e.g. a Microsoft 365 or Google
   Workspace MCP with mail and calendar search)

If either is missing: STOP. Tell them which prerequisite is absent and hand
them the setup steps (Obsidian + community plugins Dataview and MCP Tools,
vault opened; work connector signed in), then ask them to restart Claude Code
here and run `/brain-init` again. Do not attempt a degraded run — the
framework requires MCPs-first.

Also confirm the working directory is the cloned vault (contains
`Brain/README.md` and `.brain/`). If not, help them get there first.

## Phase 1 — Mechanical install

If `.gitignore` or their profile note doesn't exist yet: ask in chat for
their **first name**, **full name**, and **work email** (one message, three
answers), then run:

```
powershell -ExecutionPolicy Bypass -File .brain\install.ps1 -Name <First> -FullName "<Full Name>" -Email <email>
```

Confirm it reported `[ok]` lines. If it errored, fix and re-run before moving
on — do not proceed on a half-install.

Then, if this vault has an upstream engine repo with a maintainer (check:
`git remote get-url origin` — a team engine, not the user's own repo), set up
their contribution fork (one-time; members have read-only access to the
shared repo, so contributions travel via their own private fork):
1. Derive the upstream owner/repo from the origin URL. Ask their GitHub
   username.
2. Have them open `https://github.com/<owner>/<repo>/fork` and click
   Create fork (keep it private, their account as owner — forks must live in
   their personal namespace, never inside another organisation).
3. Run: `git remote add fork https://github.com/<username>/<repo>.git`
4. Verify with `git ls-remote fork` (a browser sign-in may pop once — fine).
If the fork page errors, forking may be disabled on the repo — tell them to
flag it to their maintainer and continue; the update script will offer this
setup again later.

## Phase 2 — Consent for the crawl

Explain in two sentences: to save them typing, you'd like to take a broad
look at their working library — folder names, file names, dates, and recent
mail/calendar patterns — to draft their client list and profile for them.
Nothing is sent anywhere; it only shapes what gets proposed for their own
vault.

Then ask permission for a **general crawl of their entire working library**
(their documents root and work mail/calendar). Offer the alternative: they
can point you at specific folders instead. Expect their folder organisation
to be entirely their own — assume nothing carries over from anyone else's.

Wait for an explicit yes (or their pointed folders) before any scanning.

## Phase 3 — Crawl (breadth first, metadata first)

- Enumerate top-level folders of the consented scope; descend only where
  names suggest client or engagement work. Names, structure, and modified
  dates first — open file contents only when a name alone can't tell you
  what something is, and never bulk-read documents.
- Mail/calendar: recent senders/recipients grouped by external domain,
  recurring meetings, subjects that look like engagements.
- Build a working hypothesis: candidate clients (with evidence), apparent
  work domains, their apparent role and rhythm.

Close the phase by reporting, in one short list, what was scanned.

## Phase 4 — Interview (informed, short)

Ask only what the crawl couldn't answer, as confirmations where possible
("These look like your active clients: X, Y, Z — which should I drop, and
who's missing?"). Cover:
1. Client list — confirm/correct candidates; current stage per client
2. Role and responsibilities
3. Working style + preferences for Claude (tone, asking vs acting) — including
   their **AI fluency** (`fluent` / `developing` / `new`), which sets how much
   Claude unpacks difficult concepts by default. Ask plainly ("How much do you
   already work with AI tools day to day?"); when unsure, default `developing`.
4. Availability constraints (leave, recurring commitments)

A few grouped questions, not a form. Their answers override crawl inferences.

## Phase 5 — Propose

Draft, and show BEFORE writing:
- `Brain/<Name>.md` — profile filled from interview (template already exists;
  set the **AI Fluency** field from their answer, default `developing` if unsure)
- `Brain/Firm.md` — starter firm/team context as THEY relate to it
- One dossier per confirmed client from `Brain/Templates/Client Template.md`,
  with `stage` frontmatter set and an opening Log entry citing the evidence
  ("created at onboarding from folder scan + interview")
- `Brain/Now/Tasks.md` — seeded with anything they named as currently pending

Present as a compact summary (file list + one line each), then ask for one
overall confirmation. Apply any corrections before writing.

## Phase 6 — Write, seed, orient

1. Write the confirmed files.
2. Seed `Brain/Sessions/YYYY-MM-DD.md` with a first handoff note ("brain
   initialised; clients A/B/C; open items ...") so their second session
   starts warm.
3. Give a 5-line orientation: where tasks show up (`Now/Tasks.md` +
   `Clients/_Index.md` in Obsidian), how to talk to the brain ("update my
   brain on X"), how updates arrive (`.brain\update.ps1` or just ask
   Claude to "run the brain update"), and that additions to contributable
   folders get proposed to the maintainer automatically.
4. List every file written. Done.
