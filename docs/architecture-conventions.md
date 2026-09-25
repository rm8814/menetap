# Menetap Architecture Conventions

## Frontend routes and screens

The MVP currently uses a single React entry point with screen state in `app/src/App.tsx`. Until a router is introduced, screen names are the route contract:

`home` → `search` → `hotel-detail` → `room-selection` → `checkout` → `confirmation`

When URL routing is introduced, use lowercase kebab-case paths matching those names. Keep URL parsing and navigation in a route/navigation layer; screens should receive typed parameters and callbacks rather than manipulating browser history directly.

Each screen owns presentation state only. Convex queries and mutations are called through typed hooks at the screen or feature boundary. Shared UI belongs in `app/src/components`; shared domain types belong in `app/src/types.ts`.

## Convex functions and service boundaries

- `query`: read-only guest or operational data.
- `mutation`: validated state changes, including booking creation and inventory updates.
- `action`: external APIs, email, payment providers, or other side effects that cannot run directly in a mutation.
- `internalQuery`/`internalMutation`: implementation helpers that are not exposed to the client.

Keep domain modules grouped by business capability (`properties.ts`, `rooms.ts`, `bookings.ts`, `payments.ts`, and so on). Validate arguments at every public function boundary. Authorization is checked inside the Convex function, never only in the React UI.

## Error handling

Backend errors should be actionable and safe for guests. Use stable error categories such as:

- `VALIDATION_ERROR` — missing or invalid input;
- `NOT_FOUND` — property, room, or booking does not exist;
- `INVENTORY_UNAVAILABLE` — requested dates are no longer available;
- `UNAUTHORIZED` — the caller is not signed in or lacks permission;
- `CONFLICT` — the requested state changed during the operation;
- `INTERNAL_ERROR` — unexpected failure, with details kept in server logs.

The UI must provide loading, empty, error, and retry states for every remote query. Booking errors must preserve the entered guest information and explain whether the guest can retry, choose different dates, or contact support. Do not display stack traces, secret values, or raw database errors.

## Naming and review rules

- Use nouns for query names (`properties.get`, `rooms.listForProperty`).
- Use verbs for mutations (`bookings.create`, `payments.recordTransfer`).
- Keep mutations small enough to validate one business transition atomically.
- Add an audit log entry for sensitive operational changes.
- Add or update a test when adding a role rule, booking transition, or inventory rule.
