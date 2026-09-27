# Menetap Design System Reference

This document is the implementation reference for Menetap’s React/Vite application.

Use existing shared classes and tokens before adding a page-specific rule.

## Color

- Background: `#F7F6FF` (violet-tinted off-white)
- Surface: `#FFFFFF`
- Primary accent — Electric Violet: `#7229FF` (hover/darken: `#5a1fd1`)
- Secondary accent — Electric Cyan: `#00CAEF`
- Ink (text): `#0C0A1E`
- Border: `#E5E2F5`
- Muted text: `rgba(12,10,30,0.5–0.65)` depending on emphasis
- Tinted fills: `rgba(114,41,255,0.06–0.08)` violet, `rgba(0,202,239,0.08–0.14)` cyan

## Typography

### Font families

- Display/headings: `Plus Jakarta Sans`, fallback `sans-serif`
- Body/UI: `JetBrains Mono`, fallback `monospace`

### Type scale

| Element | Desktop | Mobile | Weight | Font |
|---|---:|---:|---:|---|
| Hero headline H1 | 48px | 36px | 800 | Plus Jakarta Sans |
| Page heading | 40px | 32px | 800 | Plus Jakarta Sans |
| Section heading | 24px | 22px | 800 | Plus Jakarta Sans |
| Card heading | 18px | 16px | 700 | Plus Jakarta Sans |
| Body / hero supporting copy | 14px | 14px | 400 | JetBrains Mono |
| Navigation/control | 14px | 14px | 500–700 | JetBrains Mono |
| Eyebrow/badge | 12px | 12px | 600 | JetBrains Mono |
| Metadata | 11–13px | 11–13px | 400–600 | JetBrains Mono |

Hero and page headings must not inherit browser defaults. Scope page-specific headings when necessary.

## Containers and layout

The site-wide content grid is:

- Maximum content width: `1200px`
- Desktop outer gutter: `6vw`
- Mobile outer gutter: `24px`
- Center content with `margin-inline: auto`
- Full-width backgrounds may extend beyond the content grid; their inner content must use the same 1200px grid

The homepage establishes this pattern through `.app-shell`, `.section`, `.page`, `.dc-topbar-inner`, and `.dc-footer-grid`. New pages should use the same setup rather than subtracting gutters a second time.

## Spacing

Use a 4px base unit. Preferred values:

`4, 8, 12, 16, 20, 24, 32, 48, 56, 64, 80, 96`

Common patterns:

- Card padding: 16–24px
- Section bottom spacing: 54px
- Hero top spacing: 64px desktop
- Mobile page gutter: 24px
- FAQ item spacing: exactly 10px
- CTA panel padding: 32px

## Surfaces and cards

- Background: white
- Border: `1px solid #E5E2F5`
- Border radius: `8px` (cards), `4px` (inputs/tags), `24px` (pills/badges)
- Shadow: subtle violet-tinted shadow such as `0 2px 8px rgba(114,41,255,.06)`
- Hover: `translateY(-1px)` with a subtle shadow increase

Use pill radii only for badges, tags, language toggles, and compact status controls.

## Buttons and links

The homepage button baseline is the global reference:

- Font: JetBrains Mono, 14px, 700
- Padding: 12px/24px padding
- Border radius: `8px`
- Primary background: `#7229FF`
- Primary text: white
- Primary border: none
- Hover: darker violet and/or a 1px lift

Outline actions use a 1px violet-tinted border, white background, and violet text. Do not create page-specific button sizes unless the component genuinely requires one.

## Global CTA panel

The homepage `.price-alert` is the site-wide CTA reference:

- Max width: 1200px
- Padding: 32px
- Margin bottom: 56px
- Border: 1px solid `#E5E2F5`
- Radius: 8px
- Background: `linear-gradient(135deg, rgba(114,41,255,.06), rgba(0,202,239,.06))`
- Layout: flexible two-column row that wraps on mobile
- Supporting copy: max width 420px, 13px, line height 1.6

Rewards, Experiences, and Rentals must use this pattern without changing the homepage implementation.

## FAQ / accordion

All FAQ sections share one treatment:

- White card with 1px violet-tinted border
- 8px radius
- Exactly 10px between items
- Question row: minimum 56px, 16px 18px padding, 14px bold JetBrains Mono
- Answer: 13px JetBrains Mono, line height 1.8, muted dark text
- Expand control: 24px circular violet-tinted control
- Use semantic `details/summary` or an accessible button with expanded state

## Navigation and footer

### Top navigation

- Sticky full-width background with subtle blur
- 72px desktop height
- Inner max width: 1200px
- Navigation controls: 14px JetBrains Mono
- Active link: violet
- Mobile: hide desktop links and show the hamburger menu

### Footer

- Full-width white background
- Top border: `#E5E2F5`
- Inner content aligned to the 1200px site grid
- Desktop padding: 56px 6vw 32px for the full homepage footer
- Mobile content stacks vertically with 24px gutters

Use the shared `Footer` component whenever possible. Do not add mini-footers to individual landing pages unless the DC reference explicitly requires a distinct footer.

## Imagery and icons

- Lucide icons, stroke-only, 1.5px, sizes `12–14px` inline, `18–20px` in badges, `26–28px` standalone
- Icon badge pattern: `36–40px` rounded-8px square, violet tint bg, violet icon
- Inline icons: 14–16px.
- Standalone card icons: 18–26px.
- Property and experience imagery should use real approved assets where available.
- Placeholder gradients are acceptable only for prototype-only content and must not imply real inventory photography.
- Images require descriptive `alt` text.

## Responsive behavior

- Desktop-first reference layouts must collapse cleanly at approximately 900px and 560–700px depending on the component.
- Preserve 24px mobile gutters.
- Convert multi-column grids to two columns, then one column.
- CTA panels stack content and action vertically on small screens.
- Do not allow horizontal overflow from headers, grids, or footer content.

## Implementation checklist

Before marking a new screen visually complete:

- [ ] Uses the 1200px site container and homepage gutter behavior.
- [ ] Uses the correct font family, size, weight, and line height.
- [ ] Uses shared button, CTA, FAQ, navigation, and footer patterns.
- [ ] Has loading, empty, error, and mobile states where applicable.
- [ ] Has visible keyboard focus and accessible labels.
- [ ] Has no duplicate topbar or footer.
- [ ] Has no page-specific override that contradicts this document without a documented reason.
- [ ] Passes typecheck, tests, build, and diff checks.
