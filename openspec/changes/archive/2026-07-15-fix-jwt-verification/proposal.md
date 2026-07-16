## Why

`validateUser` (`server/middlewares/validate-user.ts`) authenticates every task-API request using `jwt.decode()`, which parses a JWT's payload without checking its signature. Because the server never verifies who actually signed the token, anyone can construct a token with an arbitrary `sub` claim and a fabricated signature and be treated as that user. Data access is otherwise correctly scoped (DAL queries and Postgres RLS both key off `req.user.id`), so this single gap is a full authentication bypass — full read/write/delete access to any user's tasks, with no cryptographic barrier.

## What Changes

- Replace `jwt.decode()` in `validateUser` with real signature verification against Clerk's JWKS, using `@clerk/backend`'s `verifyToken()`. **BREAKING**: requests bearing tokens that fail signature/issuer/authorized-party verification will now be rejected with 401, where they previously succeeded as long as the payload merely decoded and `exp` was in the future.
- Add `CLERK_SECRET_KEY` to `server/.env` (placeholder value; real value to be provisioned by the project owner from the Clerk dashboard) and document it as required server configuration.
- Update `server/tests/tasks.test.ts` and `server/tests/users.test.ts`, which currently mint tokens via `jwt.sign({sub: ...}, "test-secret")` — a pattern that only worked because signatures were never checked. Tests need a strategy compatible with real verification (mocking the verification call at the boundary, since standing up a live JWKS endpoint in tests is unnecessary complexity for this fix).
- No change to the token transport itself (`Authorization: Bearer` header, plus the redundant `user` field in the request body) — that cleanup is out of scope here, see below.

## Capabilities

### New Capabilities
- `api-authentication`: Verifying that inbound task-API requests carry a Clerk-issued JWT with a valid signature, matching issuer, and matching authorized party, before resolving the request to a local user record.

### Modified Capabilities
(none — no existing specs predate this change)

## Impact

- **Code**: `server/middlewares/validate-user.ts` (verification logic), `server/tests/tasks.test.ts`, `server/tests/users.test.ts` (token minting / verification mocking).
- **Config**: `server/.env` gains `CLERK_SECRET_KEY`.
- **Dependencies**: adds `@clerk/backend` to `server/package.json`.
- **Behavior**: any client currently relying on unsigned or mis-signed tokens loses access — expected, since that access was never supposed to exist. Legitimate clients (the Expo app via `@clerk/expo`) are unaffected; Clerk-issued tokens already carry valid signatures.
- **Out of scope** (noted for follow-up, not addressed by this change): open CORS policy (`cors()` with no options), global (not clearly per-user/IP) rate limiting, the redundant token-in-body pattern on POST/PUT/DELETE, and the lack of a request body size limit on `express.json()`.
