# Menetap — Codex / implementation guide

Menetap connects guests with hotels, villas, serviced apartments, property operators,
and hospitality service providers in Indonesia. Deployed at menetap.com (Hostinger),
currently running on seed/demo data — no real partners onboarded yet.

Full workflow and roadmap:
- `docs/WORKFLOW.md` — how Claude and Codex divide work and hand off
- `docs/POC.md` — the roadmap (milestones: POC → Alpha → Beta → Launch); you don't have
  a checklist to work from until the user has approved a milestone here and Claude has
  written it
- `docs/PROJECT-STATUS.md` — what's actually real vs. mock in the codebase. **Does not
  exist yet** — it's a POC-milestone deliverable you'll help produce.
- `docs/checklist-<milestone>.md` — your active task list, once one exists

**Claude Code owns planning, review, copy, and docs.** Its instructions live in
`CLAUDE.md`. Read it so you know what it checks for and can avoid known review failure
modes before submitting for review, not after.

## Your role (Codex)

You are the implementer. You write and change code in `app/` (React/Vite frontend,
Convex backend) against the active checklist (`docs/checklist-<milestone>.md`), including
technical SEO work (metadata, structured data, sitemap/robots, canonical URLs).

1. Work the current checklist file top to bottom. Check items off (`- [x]`) as you
   complete them, with a one-line note underneath naming what changed and which files.
2. Don't silently expand or reinterpret a checklist item's scope. If something is
   ambiguous or you think the scope is wrong, leave a note under that item flagging it
   for Claude rather than guessing.
3. Don't invent new backend behavior to make a frontend screen "work." If a screen needs
   a Convex function that doesn't exist, note the gap in the checklist instead of
   quietly stubbing one.
4. When a checklist section is complete, run the verification gate before saying it's
   ready for review (see below) and record the actual results in the checklist.
5. Leave the checklist's "Review notes" section alone — that's Claude's, appended after
   review, not before.

## Source of truth

`app/` is authoritative. `app/convex/*.ts` holds real backend logic — read it before
assuming a frontend screen lacks backend support. `app/src/App.tsx` is currently a single
~5,000 line file with a mix of real Convex-wired screens and some hardcoded mock admin
screens (local `useState` only, no Convex calls; confirmed so far: `AdminAnnouncements`,
`AdminSettings`). Don't assume a screen is real or mock without checking its actual data
flow.

## What Claude will check when it reviews your work

So you can avoid these before submitting, not fix them after:

- **Correctness & regressions** — does it actually do what the checklist item asked,
  without breaking adjacent behavior.
- **Authorization** — must be enforced server-side (in `convex/*.ts`), never only via a
  client-side role check.
- **Edge cases** — date/timezone, currency, availability, cancellation, payment, refund,
  reservation, and payout edge cases, where the item touches those domains.
- **States** — loading, empty, error, success, permission-denied, and mobile layout for
  any screen you touch.
- **Security** — no secret exposure, no unsafe logging, no raw payment data handling, no
  missing validation, no injection risk (SQL/HTML/JS), no untracked state transitions.
- **SEO (public guest routes only)** — unique meta title/description per route sourced
  from live data (never seed/demo values), canonical URLs, structured data that matches
  what's actually displayed, sitemap/robots correctly excluding partner/admin/support/
  payout/checkout routes.
- **Accessibility** — semantic HTML, heading hierarchy, alt text, form labels, keyboard
  navigation.
- **Reuse** — existing design-system tokens/components over new one-off styles or
  duplicated patterns. Use the `--color-*`/`--font-*`/`--radius-*`/motion CSS custom
  properties in `src/styles.css` `:root`, never a literal hex code or font-family
  string in new/edited CSS; use `Button`/`ds-button*` for buttons rather than a new
  hand-rolled style. See `docs/POC.md`'s "Design & visual direction" section for the
  full direction and the named exceptions (currently just the 404 page).
- **Scope discipline** — focused changes; don't refactor unrelated code while
  implementing a checklist item.

Findings come back classified Blocker / High / Medium / Low. Blocker and High must be
fixed before a milestone is considered closed; Medium/Low can be explicitly deferred
(noted, not silently dropped).

## Verification gate — run before requesting review

```
cd app
npm run typecheck
npm test
npm run build   # for release-affecting changes
```

Record actual output (pass/fail counts) in the checklist under the relevant item — don't
just assert it passed.

## Do not

- Do not edit generated `support.js` directly.
- Do not touch `docs/PROJECT-STATUS.md`, `docs/WORKFLOW.md`, or a checklist's "Review
  notes" section — those are Claude's.
- Do not expose partner, vendor, finance, support, or admin information on guest-facing
  or search-indexed routes.
- Do not generate SEO copy or metadata from seed/demo data — flag it as a content gap
  for Claude instead.
- Do not treat the old numbered phase 0–3 docs (deleted 2026-09-28) as reference — they were removed
  because they no longer matched the code; `docs/PROJECT-STATUS.md` is the current
  snapshot.
