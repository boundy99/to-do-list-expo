## 1. Dependencies and configuration

- [ ] 1.1 Add `@clerk/backend` to `server/package.json` and install it
- [ ] 1.2 Add `CLERK_SECRET_KEY=` placeholder to `server/.env`, with a comment noting the real value must come from the Clerk dashboard before deploy

## 2. Verification logic

- [ ] 2.1 Replace `jwt.decode()` in `server/middlewares/validate-user.ts` with `@clerk/backend`'s `verifyToken()`, verifying signature, expiry, and `azp` (authorized party)
- [ ] 2.2 Return 500 (mirroring `server/routes/webhooks.ts`'s pattern) if `CLERK_SECRET_KEY` is unset, without attempting any token decoding
- [ ] 2.3 Return 401 for any verification failure (bad signature, expired, wrong `azp`) without leaking which check failed
- [ ] 2.4 Keep existing behavior: on successful verification, resolve the subject to a local user via `findUserByClerkId`, and return 401 if no local user matches

## 3. Tests

- [ ] 3.1 Update `server/tests/tasks.test.ts` to mock `@clerk/backend`'s `verifyToken` at the module boundary instead of signing tokens with `jwt.sign(..., "test-secret")`
- [ ] 3.2 Update `server/tests/users.test.ts` with the same mocking strategy
- [ ] 3.3 Add a test case for a token that fails verification (bad signature / wrong `azp`) asserting 401 and that no user is attached to the request
- [ ] 3.4 Add a test case for `CLERK_SECRET_KEY` unset asserting the request is rejected without decoding
- [ ] 3.5 Run `server`'s test suite and confirm all tests pass

## 4. Manual verification

- [ ] 4.1 Configure a real `CLERK_SECRET_KEY` locally (not committed) and confirm the running Expo client can still authenticate successfully end-to-end
- [ ] 4.2 Confirm a hand-crafted token with an arbitrary `sub` and invalid signature is now rejected with 401 against the running server
