# Aninda Wida Design System

A light-mode design system for **Aninda Wida**'s personal platforms (anindawida.com), derived from the UPSCALE brand identity with a deliberate inversion: where UPSCALE runs dark, this system runs light — retaining the same electric violet and cyan accent language.

---

## Sources

- **UPSCALE website**: https://upscale.asia — primary source for brand aesthetic, visual language, and component patterns
- **Aninda Wida personal site**: https://anindawida.com — primary consumer of this design system
- No Figma file or codebase was attached. Visual system derived from live site inspection.

> ⚠️ **Logo note**: Logos are currently referenced via external URLs (see Assets section). Download and save locally for production use.

---

## Brand Context

**Aninda Wida** (goes by "Anin") is a web developer, writer, and musician based in Indonesia. She is the founder of **UPSCALE** — a tech-driven hotel management and distribution company in Southeast Asia. Her personal site (anindawida.com) serves as a portfolio, blog, and personal creative space.

The design system bridges two sides of her identity:
- The **professional/tech** side (UPSCALE: data-forward, electric, precise)
- The **personal/creative** side (anindawida.com: warm, reflective, authentic)

The result is a light, airy system with electric accent pops — sophisticated but approachable.

---

## CONTENT FUNDAMENTALS

**Voice:** First person ("I", "me", "my"). Direct but warm. Not stiff corporate — more like a smart friend who knows what they're doing.

**Tone:** Honest and self-aware. Anin leans into imperfection ("perfectly imperfect"), growth, and relatability. No hustle-culture bravado.

**Casing:**
- Headings: Sentence case (not Title Case or ALL CAPS)
- CTAs: Short, verb-first — "Explore services", "Work with us", "Read more"
- Navigation: Capitalized single words

**Emoji:** Used sparingly on UPSCALE (⚡ as a brand mark for "tech-driven"). On Aninda's personal site, no emoji in headings or UI — only in casual blog copy or social contexts.

**Numerics:** Large metrics are highlighted with `+` or `−` prefix and bold type (UPSCALE style: "+26% RevPAR"). Personal site uses more prose, fewer metrics.

**Links:** Descriptive, never "click here". "Work Portfolio", "Music I Wrote", "Chat on WhatsApp".

**Copy examples (Aninda voice):**
- "Hi, it's me Anin."
- "If you've somehow found your way to this little corner of the internet…"
- "This is a space to embrace the perfectly imperfect."
- "We're not aiming for some flawless ideal here."

**Copy examples (UPSCALE professional voice):**
- "We orchestrate results, hotels enjoy performance."
- "Every property has these 8 levers. Most are disconnected."
- "Decisions backed by data instead of guesswork."

---

## VISUAL FOUNDATIONS

### Color
- **Background**: Off-white with a faint violet cast (`#F7F6FF`). Not pure white — just barely tinted to feel cohesive with the violet accent system.
- **Surface**: Pure white (`#FFFFFF`) for cards and elevated containers.
- **Electric Violet** (`#7229FF`): Primary brand accent. Used for CTAs, links, highlights, focus rings. Vivid, slightly blue-leaning violet.
- **Electric Cyan** (`#00CAEF`): Secondary accent. Used for live indicators, data callouts, complementary highlights, hover flourishes.
- **Ink** (text): Deep violet-charcoal (`#0C0A1E`) — not pure black, carries a subtle violet undertone that harmonizes with the accent palette.

### Typography
- **Display** — `Plus Jakarta Sans`: Modern, expressive, premium. Used for H1–H3 and large hero numerics. Designed by Indonesian designer Gumpita Rahayu — a culturally fitting choice.
- **Body** — `JetBrains Mono`: Technical and distinctive, lending a developer character to all prose and UI text. Use at line-height 1.7–1.8 for readability.
- **Mono** — `JetBrains Mono`: For code snippets, data values, metrics, technical labels.
- Line heights: generous (1.5–1.7 for body, 1.1–1.2 for display).
- Letter spacing: slightly tightened for display (`−0.02em`), normal for body.

> ⚠️ **Font substitution**: Google Fonts CDN is used for all three families. If custom-licensed fonts are available, replace the `@import` in `tokens/fonts.css`.

### Spacing
- Base unit: `4px`. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Layout gutter: 24px (mobile), 48px (desktop).
- Section vertical rhythm: 80–120px between major sections.

### Backgrounds
- Flat color only. No full-bleed images, no textures, no gradients on backgrounds.
- The subtle violet tint of the base background IS the "texture" — it's enough.
- Accent gradients are used only on specific brand elements (hero tagline pills, metric cards).

### Cards
- Border radius: `8px`. Slightly rounded — not pill, not sharp.
- Border: `1px solid var(--color-border)` (`#E5E2F5`).
- Background: `#FFFFFF`.
- Shadow: `0 2px 8px rgba(114, 41, 255, 0.06)` — very subtle violet-tinted shadow.
- No colored left-border accent pattern.

### Shadows
- Scale: none → xs → sm → md → lg
- All shadows carry a faint violet tint (never neutral gray) to feel on-brand.

### Borders & Radius
- Default border: `1px solid #E5E2F5` (violet-tinted gray)
- Radius: `4px` (small elements: inputs, tags), `8px` (cards, modals), `24px` (pill buttons/badges)
- No hairline borders (0.5px).

### Animation & Motion
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — smooth deceleration (matches UPSCALE's clean, no-bounce feel)
- Duration: `150ms` (micro), `250ms` (standard), `400ms` (entrance)
- No bouncy springs. No infinite decorative loops.
- Hover: slight lift (`translateY(-1px)`) + shadow increase on cards. Color shift on text links.
- Press: `scale(0.97)` on interactive elements.

### Hover States
- Buttons: darken primary color by ~10%
- Cards: elevate shadow, slight translateY
- Links: underline + color shift to violet
- Tags/badges: subtle background tint increase

### Imagery
- Warm-neutral or slightly desaturated. No heavy grain filters.
- If using photos: lifestyle over stock. Human, genuine.
- No AI-generated imagery in the system.

### Iconography
See ICONOGRAPHY section below.

### Use of Transparency / Blur
- Backdrop blur used sparingly on sticky nav (`backdrop-filter: blur(12px)` with semi-transparent white).
- Tinted overlays use violet or cyan at low opacity (5–10%).
- No frosted glass on cards — keeps the system grounded.

---

## ICONOGRAPHY

**Source**: No custom icon set was found in the source materials. The UPSCALE site uses Elementor's built-in icon font (Font Awesome-based), and the personal site does the same.

**Substitution**: This design system uses **Lucide Icons** (CDN) as the icon system — clean 1.5px stroke, 24px grid, consistent with the modern aesthetic of both sites.

```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="arrow-right"></i>
<script>lucide.createIcons();</script>
```

**Usage rules:**
- Size: `16px` (inline/label), `20px` (button icon), `24px` (standalone)
- Stroke width: `1.5px`
- Color: inherits from text color or explicit accent color
- Never filled icons — stroke only
- UPSCALE uses ⚡ as a brand emoji mark (not an icon font glyph)

> ⚠️ **Flag**: Lucide substitutes for Font Awesome. Provide the original icon font if exact glyph matching is needed.

---

## ASSETS

```
assets/
  logos/
    upscale-logo.webp      — UPSCALE logo (downloaded from upscale.asia)
    anin-logo.svg          — Aninda Wida personal logo (downloaded from anindawida.com)
    anindawida-favicon.svg — Site favicon
```

**Remote sources** (download and save locally for production):
- UPSCALE logo: `https://upscale.asia/wp-content/uploads/2026/05/upscale-logo.webp`
- Anin logo: `https://anindawida.com/wp-content/uploads/2025/05/anin-logo.svg`
- Favicon: `https://anindawida.com/wp-content/uploads/2025/05/anindawida-favicon.svg`

---

## COMPONENTS

Built in `components/core/`. Standard set (no source component inventory was provided):

| Component | Description |
|-----------|-------------|
| `Button`  | CTA buttons — primary, secondary, ghost, outline; sm/md/lg |
| `Card`    | Surface container — default, elevated, outlined |
| `Badge`   | Inline status/label pill — violet, cyan, neutral, success, error |
| `Input`   | Text input with label, hint, error states |
| `Tag`     | Small category/topic label — compact, colored |
| `Stat`    | Metric display with label and delta (UPSCALE-style) |

**Intentional additions** (not from source, added for completeness):
- `Stat` — UPSCALE's design prominently features metric callouts; this component formalizes that pattern.

---

## UI KITS

- `ui_kits/personal_website/` — Interactive recreation of anindawida.com

---

## FILE INDEX

```
styles.css                     Global CSS entry point (imports only)
tokens/
  fonts.css                    @font-face + Google Fonts import
  colors.css                   Color custom properties
  typography.css               Type scale + font variables
  spacing.css                  Spacing scale
  shadows.css                  Shadow scale
  motion.css                   Easing + duration tokens
components/
  core/
    Button.jsx / .d.ts         CTA buttons
    Card.jsx / .d.ts           Surface cards
    Badge.jsx / .d.ts          Status badges
    Input.jsx / .d.ts          Form inputs
    Tag.jsx / .d.ts            Category tags
    Stat.jsx / .d.ts           Metric stats
    core.card.html             Component showcase card
guidelines/
  colors-violet.card.html      Violet palette specimen
  colors-cyan.card.html        Cyan palette specimen
  colors-ink.card.html         Ink + surface specimen
  colors-semantic.card.html    Semantic color specimen
  type-display.card.html       Display type specimen
  type-body.card.html          Body + mono type specimen
  spacing.card.html            Spacing scale specimen
  shadows.card.html            Shadow + radius specimen
  brand.card.html              Brand overview
assets/
  logos/                       Logo files
ui_kits/
  personal_website/
    index.html                 Interactive site mockup
readme.md                      This file
SKILL.md                       Agent skill definition
```
