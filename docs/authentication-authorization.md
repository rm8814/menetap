# Menetap Authentication and Authorization

## Current state

Menetap has the user-role model and authorization helpers in `app/convex/roles.ts` and `app/convex/authorization.ts`. Convex Auth is now initialized with an email/password provider, password-reset flow, and a Menetap guest profile. The frontend header is session-aware and a reusable `RoleGate` is available for protected screens. Guest booking still works without an account, which is intentional for the MVP funnel.

## Planned identity boundary

Use a Convex-compatible identity provider for account sessions. The provider must expose a stable authenticated subject that can be mapped to one record in `users`. Never trust a role supplied by the browser. Resolve the user and role server-side for every protected query or mutation.

Required account capabilities:

- guest registration and login;
- password reset or provider-managed recovery;
- sign out and session expiry;
- optional guest booking lookup without an account using booking reference plus verified contact information;
- staff role assignment through a protected admin operation.

## Route and navigation policy

- Guest browsing and checkout remain public.
- Guest account and booking history require an authenticated guest session.
- Partner, vendor, support, operations, finance, and admin screens require both authentication and the appropriate role.
- Hiding a navigation item is only a usability feature; Convex authorization remains mandatory.
- Unauthorized users receive a safe permission-denied state and are not redirected in a way that leaks whether a resource exists.

## Sensitive audit events

Record an `auditLogs` entry for role changes, account suspension, property approval, availability overrides, booking cancellation by staff, payment verification, and manual data corrections. Store actor, action, entity type/id, timestamp, and minimal metadata; never store passwords, tokens, or full payment details.

## Implementation gate

Do not mark authentication complete until the Resend secrets are configured, local sign-in and reset work end-to-end, a protected Convex query rejects anonymous access, and each supported role has a tested allow/deny case.
