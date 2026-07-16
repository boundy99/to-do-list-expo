## Context

`server/middlewares/validate-user.ts` currently calls `jwt.decode()` on the bearer token, reads `sub`/`exp` from the unverified payload, and looks up a local user by that `sub`. No signature check ever happens, and the server has no Clerk server-side credential (`CLERK_SECRET_KEY`) configured at all. Everything downstream — `req.user.id` threaded through the DAL (`server/dal/tasks.ts`), Postgres RLS (`server/database/rls.ts`) — correctly scopes data access to `req.user.id`, so the only gap is that `req.user.id` can currently be set to anyone's id by anyone.

The client is an Expo app using `@clerk/expo`, which already produces properly signed Clerk session tokens. The fix only needs to make the server actually check what the client is already sending correctly.

The existing webhook route (`server/routes/webhooks.ts`) already establishes the pattern this change follows: read a secret from `process.env`, fail closed with a clear error if it's missing, verify cryptographically before trusting the payload.

## Goals / Non-Goals

**Goals:**
- Reject any task-API request whose bearer token does not carry a valid Clerk signature, issuer, and authorized-party (`azp`) match.
- Keep the change scoped to `validateUser` and its tests — no changes to route wiring, DAL, or RLS, since those are already correctly scoped by `req.user.id`.
- Fail closed: if `CLERK_SECRET_KEY` is missing or verification errors for any reason, reject the request (mirrors the existing webhook secret pattern).

**Non-Goals:**
- Not touching CORS policy, rate limiting, the redundant token-in-body pattern, or request body size limits — flagged as follow-up in the proposal, not this change.
- Not changing how the Expo client acquires or sends tokens — `@clerk/expo` already does this correctly.
- Not standing up a live JWKS test server — see testing decision below.

## Decisions

### Use `@clerk/backend`'s `verifyToken()` rather than a hand-rolled `jsonwebtoken` + `jwks-rsa` verifier

`verifyToken()` fetches and caches Clerk's JWKS, handles key rotation transparently, and checks the `azp` (authorized party) claim against configured origins — i.e., it rejects a token that's valid for a *different* Clerk-connected application if one is ever added. A manual `jwks-rsa` implementation would need to reimplement all of that by hand, and getting the `azp` check right is easy to get subtly wrong. The added dependency weight is a reasonable trade for correctness in the one piece of code every request passes through.

Alternative considered: Clerk's remote `authenticateRequest`, which calls out to Clerk on every request. Rejected — it adds network latency to every task-API call for no benefit over local JWKS verification, which is already fully offline after the first fetch.

### Fail closed if `CLERK_SECRET_KEY` is unset

Mirrors `server/routes/webhooks.ts:10-12`, which returns 500 if `CLERK_WEBHOOK_SECRET` is missing rather than silently skipping verification. `validateUser` should do the same: missing config is a server misconfiguration, not something to degrade gracefully around by falling back to unverified decoding.

### Testing: mock the verification boundary, don't stand up a real JWKS server

`server/tests/tasks.test.ex.ts` and `server/tests/users.test.ts` currently do `jwt.sign({sub: ...}, "test-secret")` and rely on `jwt.decode()` never checking the secret. Once `validateUser` calls `verifyToken()`, that pattern can't produce a token that passes real verification without a live Clerk test instance or a locally generated keypair served over a mock JWKS endpoint — both heavier than this test suite needs. Instead, mock `@clerk/backend`'s `verifyToken` at the module boundary (same technique already used for `../database/connection` and `../database/rls` in these test files) so tests control the resolved payload directly, while still exercising the "invalid token → 401" and "valid payload but unknown user → 401" paths that matter.

Alternative considered: generate a real RSA keypair in test setup and serve it via a local JWKS mock (e.g. `nock` or an in-process HTTP server). Rejected as unnecessary weight for this fix — it tests that `verifyToken()` itself works, which is Clerk's responsibility to guarantee, not this codebase's.

## Risks / Trade-offs

- **[Risk] `CLERK_SECRET_KEY` ships as a placeholder and is never replaced with a real value** → the server fails closed (every request gets 401/500 rather than silently accepting forged tokens), which is the safe failure direction, but it does mean deploys will look "broken" until the real key is set. Flag this explicitly in tasks.md and call it out as a deploy blocker, not a silent gap.
- **[Risk] `azp` check rejects legitimate requests if the authorized-parties list isn't configured to match the Expo app's actual origin/scheme** → verify manually against a real Clerk-issued token from the running Expo app before considering this change complete; don't rely on unit tests alone for this part, since the tests mock verification and won't catch a real misconfiguration.
- **[Trade-off] New runtime dependency (`@clerk/backend`)** → accepted; the alternative (hand-rolled JWKS verification) carries more long-term maintenance risk in exactly the code path that matters most.

## Migration Plan

1. Add `@clerk/backend` to `server/package.json`.
2. Add `CLERK_SECRET_KEY=` (placeholder) to `server/.env`; document that the real value must come from the Clerk dashboard before this ships anywhere real requests hit the server.
3. Replace `jwt.decode()` in `validateUser` with `verifyToken()`, fail closed on missing config or verification failure, keep the existing "user not found locally" 401 behavior after a token verifies.
4. Update `server/tests/tasks.test.ts` and `server/tests/users.test.ts` to mock the verification boundary instead of signing tokens with an arbitrary secret.
5. Manually verify against the real running Expo client + Clerk test instance (not just unit tests) before merging, to catch `azp`/issuer misconfiguration that mocks can't surface.
6. No rollback complexity beyond reverting the commit — this change touches no persisted data or migrations.

## Open Questions

- Does this Clerk instance need to authorize more than one client (e.g. a future web dashboard) via the `azp` check, or is the Expo app the only authorized party for now? Affects how `authorizedParties` is configured on `verifyToken()`.
