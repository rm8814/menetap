# Phase 2 booking accessibility QA

Run with keyboard only, NVDA/VoiceOver, and browser contrast tools at mobile and desktop widths.

## Keyboard and focus

- Tab order follows destination → dates → guests → search, then page content.
- Every button, link, select, input, dialog control, and stepper is reachable.
- Focus indicator is visible against white cards and violet backgrounds.
- Escape closes guest popovers, date editors, and modals where appropriate.
- Focus is trapped inside open dialogs and returns to the trigger after close.
- No keyboard-only action depends on hover or pointer movement.

## Labels and semantics

- Every input has an associated visible label or an accurate accessible name.
- Guest counters expose their current value and increase/decrease action.
- Date inputs expose check-in/check-out meaning and format.
- Search, filter, sort, tabs, and view toggles expose selected state.
- Loading, empty, error, success, and availability changes use status/live regions where needed.
- Headings follow a logical hierarchy and landmark regions are present.

## Contrast and visual communication

- Body and control text meets WCAG AA contrast.
- Focus, error, warning, success, and availability states use text or icons in addition to color.
- Disabled controls remain distinguishable without becoming unreadable.
- Error messages appear next to the relevant field and are announced where needed.

Record assistive technology, browser, viewport, route, result, and severity for each failure. Fix blockers before Phase 2 launch.
