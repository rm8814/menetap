# How we build Menetap: Claude ↔ Codex division of labor

## Roles

- **Claude (planning + review + copy/docs)**
  - Owns the overall roadmap. Writes and maintains `docs/POC.md` (milestones: POC →
    Alpha → Beta → Launch) and, once a milestone is user-approved, the
    `docs/checklist-<milestone>.md` for that milestone.
  - **Never creates or hands off a milestone checklist without explicit user approval
    of that milestone's scope in `docs/POC.md` first.**
  - Reviews Codex's work once a milestone/checklist item is marked done — correctness,
    security, accessibility, SEO, responsive behavior (per `CLAUDE.md` review criteria).
  - Owns copywriting (guest-facing, error/empty/loading states, legal/policy pages) and
    all documentation (`docs/PROJECT-STATUS.md`, this file, checklists, review notes).
  - Does not write feature code directly except small copy/content edits.

- **Codex (implementation)**
  - Implements checklist items, including technical SEO work (metadata, structured data,
    sitemap/robots, canonical URLs) per the checklist's acceptance criteria.
  - Checks off items in the checklist file as it completes them and leaves brief notes
    (what changed, files touched) inline under each item.
  - Does not rewrite the checklist's scope; flags scope questions back for Claude to
    resolve rather than improvising.

## Source of truth

- `docs/POC.md` is the roadmap: milestones from POC (finishing today's half-built
  prototype honestly) through Alpha, Beta, and Launch with real data and complete
  legal documents, at a level the user can approve or redirect before any
  implementation checklist exists.
- Checklists are markdown files in `docs/`, named `docs/checklist-<milestone>.md`
  (e.g. `docs/checklist-poc-a.md`, `docs/checklist-poc-c-rewards.md`). A checklist is
  only created for a milestone/pillar the user has approved.
- A design doc that precedes a checklist (schema/API proposals needing approval before
  any checklist exists — currently only POC-C's new pillars need this) is named
  `docs/design-<milestone>.md` (e.g. `docs/design-poc-c-rewards.md`), so the two kinds
  of document are distinguishable by prefix at a glance.
- Each checklist item should be concrete and independently verifiable (a file, a route,
  a behavior), not vague ("improve SEO").
- Review notes go in the same checklist file, in a `## Review notes` section appended
  after Claude reviews, not in a separate file — keeps the whole lifecycle of a
  milestone in one place.

## Cycle

0. Claude drafts/updates `docs/POC.md`. User reviews and approves scope for the next
   milestone specifically — approval of the overall roadmap shape is not approval to
   start building a milestone.
1. Only after that approval, Claude writes `docs/checklist-<milestone>.md` (scope,
   acceptance criteria per item) for that milestone.
2. Codex implements against it, checking items off with notes.
3. User signals a milestone is "done enough to review."
4. Claude reviews: reads the diff/current code (not just the checklist), runs
   `npm run typecheck && npm test` (and `npm run build` for release-affecting changes),
   checks against `CLAUDE.md` review criteria, and appends findings (Blocker/High/Medium/
   Low) to the checklist's review notes section.
5. Blockers/High go back to Codex before the milestone is considered closed. Medium/Low
   can be deferred explicitly (noted as deferred, not silently dropped).
6. Claude updates `docs/PROJECT-STATUS.md` once a milestone closes so it stays a live,
   accurate snapshot — not another doc that goes stale.

## Ground rules

- Never resurrect the old phase-0/1/2/3 docs deleted on 2026-09-28 as authoritative —
  they no longer matched `app/` and their completion was unverified.
  `docs/PROJECT-STATUS.md` is the current snapshot.
- Live property/rate/availability data is the source of truth for any SEO copy or
  metadata — never generate it from seed/demo values (per `CLAUDE.md`).
