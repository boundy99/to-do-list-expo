# api-authentication

## Purpose

TBD — captures how the task API authenticates incoming requests: verifying bearer token signatures against Clerk's published keys, enforcing authorized-party checks, failing closed when server credentials are missing, and resolving verified identities to local user records.

## Requirements

### Requirement: Bearer token signature verification
The system SHALL cryptographically verify the signature of any bearer token presented to the task API against Clerk's published signing keys before treating the token's claims as trustworthy. Tokens with missing, invalid, or unverifiable signatures SHALL be rejected with 401 and never used to resolve a user.

#### Scenario: Token with a valid Clerk signature
- **WHEN** a request to a task-API endpoint carries a bearer token that was signed by Clerk and has not expired
- **THEN** the request proceeds to user resolution

#### Scenario: Token with a forged or invalid signature
- **WHEN** a request carries a bearer token whose payload claims an arbitrary `sub` but whose signature does not verify against Clerk's signing keys
- **THEN** the system responds 401 and does not resolve or attach any user to the request

#### Scenario: Missing token
- **WHEN** a request to a task-API endpoint carries no bearer token
- **THEN** the system responds 401 without attempting verification

#### Scenario: Expired token
- **WHEN** a request carries a token with a valid signature but an `exp` claim in the past
- **THEN** the system responds 401

### Requirement: Authorized-party enforcement
The system SHALL verify that a token's authorized party (`azp`) claim matches an application the server is configured to trust, rejecting tokens that are validly signed by Clerk but were issued for a different application.

#### Scenario: Token issued for a different application
- **WHEN** a request carries a validly signed Clerk token whose `azp` claim does not match a configured authorized party
- **THEN** the system responds 401

### Requirement: Fail-closed on missing server credentials
The system SHALL refuse to process authenticated requests if the server-side Clerk credential required for verification is not configured, rather than falling back to unverified token parsing.

#### Scenario: Clerk secret key not configured
- **WHEN** the server receives a task-API request and `CLERK_SECRET_KEY` is unset or empty
- **THEN** the system responds with an error status and does not attempt to decode or trust any claim from the presented token

### Requirement: Verified identity resolves to a local user record
After a token's signature, expiry, and authorized party are verified, the system SHALL resolve the token's subject to a local user record and reject the request if no matching user exists locally.

#### Scenario: Verified token with no matching local user
- **WHEN** a request carries a validly signed, non-expired, correctly-authorized-party token whose subject does not match any local user record
- **THEN** the system responds 401 and does not attach a user to the request

#### Scenario: Verified token with a matching local user
- **WHEN** a request carries a validly signed, non-expired, correctly-authorized-party token whose subject matches a local user record
- **THEN** the system attaches that user to the request and allows it to proceed to the route handler
