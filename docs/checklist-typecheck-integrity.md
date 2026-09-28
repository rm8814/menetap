# Checklist: Fix typecheck script, restore deleted partner screens, clear real type errors

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope: urgent, self-identified during an unrelated task (2026-09-28). Not a POC-C
pillar — a correctness/process fix that takes priority over pillar work._
_Independent of Rentals/Experiences design work — do this first._

## Why this exists — read before starting

`npm run typecheck` (`tsc --noEmit`) has been a **no-op** this entire project: the
root `tsconfig.json` has `"files": []` with only project references, and without a
build flag `tsc --noEmit` checks an empty file set. Confirmed with
`npx tsc --noEmit --listFiles` — zero files. **Every "typecheck passed" claim in every
prior checklist review this session was against nothing.** Separately,
`app/src/App.tsx` has `// @ts-nocheck` at line 1 (present since one of the earliest
commits, not introduced by any checklist here), which — once the script actually
worked — would still exempt that file from checking on its own.

The combination hid a real regression: commit `4964a0f` (the "delete six `Legacy*`
dead-code components" work from `checklist-poc-b.md`) accidentally deleted six
**real, non-Legacy** components too — they were interleaved with the Legacy ones in
the file and the deletion swept too wide. `PartnerProperties`, `PartnerInventory`,
`PartnerBookings`, `PartnerLogin`, `PartnerServices`, `PartnerRoomDetail` are all still
referenced in JSX (routing already points to them correctly) but no longer defined
anywhere. Three of these are linked directly from `PartnerDashboard`'s own sidebar —
**any real partner clicking their own dashboard navigation today gets a runtime
crash.**

## 1. Fix the typecheck script first — so everything after this is actually verified

- [ ] Fix `npm run typecheck` to actually check the app. Confirmed working approach:
      `tsc --noEmit -p tsconfig.app.json` checks `src/` correctly (verified — it
      surfaces real errors). Update `package.json`'s `typecheck` script accordingly,
      or fix the root `tsconfig.json`/build setup if you find a cleaner composite-
      project approach — either way, confirm with `--listFiles` that it's actually
      processing `src/*.ts(x)` files afterward, not just that the command exits 0.
- [ ] Do not proceed to the sections below until this genuinely works — verify by
      temporarily reintroducing a one-line obvious type error and confirming the
      script catches it, then revert.

## 2. Restore the six accidentally-deleted real components

- [ ] Pull the pre-deletion source for `PartnerProperties`, `PartnerInventory`,
      `PartnerBookings`, `PartnerLogin`, `PartnerServices`, `PartnerRoomDetail` from
      git history: `git show 4964a0f^:app/src/App.tsx` has them (or
      `git show 4964a0f -- app/src/App.tsx` to see the diff directly). Restore them
      into `App.tsx`.
- [ ] **Do not paste back blindly** — the Convex schema/API has changed since that
      commit (supplier marketplace, rewards, payments, commissions all landed after
      it). Check each restored component's `api.*` calls still match current function
      signatures in `convex/`. Fix any that drifted; flag any that reference something
      that no longer exists rather than guessing at a replacement.
- [ ] Confirm routing already correctly references these six (it does — the
      `screen === "..."` lines were never removed) — no routing changes should be
      needed, just the definitions coming back.

## 3. Remove `@ts-nocheck` and fix what it was hiding

- [ ] Remove the `// @ts-nocheck` line from `App.tsx`.
- [ ] Fix the real errors this surfaces beyond the six components above (verified
      count with the script working: ~17 more). Known ones from this investigation:
      - `GuestScreen` type comparisons with `"notFound"`, `"rentalsLanding"`,
        `"rentalSearch"` reported as non-overlapping — likely these literals are
        missing from `GuestScreen`'s union in `types.ts`; add them if so.
      - A `liveNightlyRates` property access that doesn't exist on the inferred type
        around line ~4173 — investigate whether this is a stale reference or a real
        missing field.
      - A few `string | boolean`/`unknown` typing looseness spots (~line 4457, 4472,
        4473, 4538) — fix with real types, not `as any` casts (that would just
        reintroduce the same blind spot `@ts-nocheck` created, in miniature).
- [ ] If any error turns out to be large/risky to fix correctly (not just annoying),
      flag it here rather than papering over it with a narrow suppression — this
      checklist exists specifically to stop hiding real errors.

## 4. Verification gate — this time it actually means something

- [ ] `npm run typecheck` — from `app/`, confirm **zero errors with the script
      actually processing files** (not just exit code 0).
- [ ] `npm test` — from `app/`, record actual pass/fail counts.
- [ ] `npm run build` — from `app/`.
- [ ] Manually confirm (or add a test if reasonably cheap) that visiting
      `/en/partner-properties`, `/en/partner-inventory`, `/en/partner-bookings` no
      longer crashes.

## Results (Codex fills in)

_(What was fixed in each section, files touched, any error left unresolved with a
one-line reason why.)_

## Review notes

_(Claude fills this in after reviewing completed work — Blocker/High/Medium/Low.)_
