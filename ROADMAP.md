# Atticus Mock Service
## Product Roadmap & Architecture Direction

Atticus is a Playwright-first service interaction record/replay framework focused on deterministic testing, debuggable mocks, contract stability, and low-friction adoption.

The immediate priority is not adding more protocols. Before expanding the technical surface area, Atticus should be easy to release, easy to install, easy to understand, and safe to change.

---

# Product principles

1. **Low friction first**
   - A user should be able to install Atticus, attach it to Playwright, and record/replay traffic with minimal configuration.

2. **Deterministic and debuggable**
   - The same interaction should replay the same way.
   - Misses and mismatches should explain *why* they did not match.

3. **Transport and protocol are different concerns**
   - HTTP and WebSocket are transports.
   - REST/OpenAPI, GraphQL, XML/SOAP, and other API semantics sit above those transports.
   - Protocol support should not create protocol-specific branches throughout core interception code.

4. **Pluggable persistence**
   - Local file storage remains the zero-infrastructure default.
   - Core record/replay behavior should not depend directly on the filesystem.

5. **Grow around the core, not through it**
   - New capabilities should extend stable interfaces rather than continuously expanding `MockService`.

6. **A roadmap item must justify itself as a product feature**
   - Learning value is welcome, but features belong in Atticus only when they improve the framework for real consumers.

---

# Current baseline

Atticus currently provides:

- Playwright-first HTTP interception.
- `record`, `replay`, and `auto` modes.
- Request-body parsing and signature generation.
- File-backed mock persistence.
- TypeScript package output published as `@zerograviti/atticus-mock-service`.
- Initial CI, tests, CLI/runtime structure, and roadmap scaffolding.

The package is currently at the `0.1.x` stage. The next work should make that foundation trustworthy before expanding the protocol surface.

---

# Phase 0 — Release integrity

**Goal:** make every release repeatable, gated, and attributable.

### 1. Repair and harden GitHub Actions CI — #10
- Fix the existing workflow runner and command errors.
- Make lint a real gate instead of suppressing failures.
- Validate build and tests.
- Establish an intentional supported Node policy.
- Correct package engine metadata.

### 2. Automate npm publishing with trusted publishing — #11
- Publish from an intentional GitHub release event.
- Use npm Trusted Publishing / GitHub Actions OIDC rather than a long-lived publish token.
- Validate version/tag consistency before publishing.
- Generate npm provenance for public releases.
- Document the release procedure.

**Exit condition:** a maintainer can create a release without manually running `npm publish`, and a broken build cannot publish.

---

# Phase 1 — Documentation and consumer confidence

**Goal:** a new user should be able to understand, install, and validate Atticus without reading source code.

### 3. Rewrite README and establish user-facing documentation — #12
Document:
- what Atticus solves
- installation
- Playwright fixture integration
- record/replay/auto behavior
- configuration
- mock lifecycle
- request matching
- architecture
- troubleshooting and TLS behavior
- current limitations vs roadmap capabilities

Create focused documentation under `/docs` rather than allowing the README to become the entire manual.

### 4. Add runnable Playwright examples and package smoke test — #13
- Add a self-contained Playwright example.
- Demonstrate record, replay, and auto modes.
- Consume Atticus as a packaged dependency, not through source imports.
- Validate packaging/install behavior in CI.

**Exit condition:** the README quick start and example project work from a clean checkout/package install and are validated by CI.

---

# Phase 2 — Architecture for expansion

**Goal:** separate the concerns that currently converge inside `MockService` before adding new transports and protocols.

### 5. Refactor transport and protocol responsibilities — #14
Move toward an architecture where `MockService` orchestrates components rather than implementing every concern directly.

Conceptually:

```text
Atticus / MockService
        |
        +-- Transport
        |     +-- HTTP
        |     +-- WebSocket
        |
        +-- Protocol semantics
        |     +-- Generic HTTP / REST
        |     +-- OpenAPI
        |     +-- GraphQL
        |     +-- XML
        |
        +-- Matching
        |
        +-- Storage
```

This is a direction, not a requirement to introduce unnecessary abstraction before behavior exists.

### 6. Introduce `MockStorage` and in-memory storage — #15
- Define a stable storage interface.
- Keep file storage as the default implementation.
- Add in-memory storage for deterministic tests and custom consumers.
- Inject storage rather than constructing filesystem persistence inside core logic.

### 7. Add configurable request normalization and matching — #16
- Canonical JSON request bodies.
- Defined query-parameter behavior.
- Configurable header inclusion/exclusion.
- Strategies for volatile values such as tokens, timestamps, and correlation IDs.
- Actionable diagnostics for mock misses.
- Extension points for GraphQL/XML-specific matchers.

**Exit condition:** HTTP record/replay behavior is still backwards-compatible, but storage, matching, and transport behavior can evolve independently.

---

# Phase 3 — REST contracts and OpenAPI

**Goal:** move beyond opaque HTTP recording into contract-aware REST testing.

### 8. OpenAPI loader, mock generation, and response validation — #17
- Load OpenAPI 3.x JSON/YAML.
- Resolve operations by method/path.
- Generate starter mocks from examples/defaults.
- Validate recorded/replayed responses against schemas.
- Report contract drift clearly.

OpenAPI remains optional. Generic HTTP recording must continue to work without a specification.

**Exit condition:** Atticus can explain not only that a REST response changed, but whether it still satisfies its declared contract.

---

# Phase 4 — GraphQL

**Goal:** treat GraphQL operations semantically instead of as opaque POST bodies sent to one endpoint.

### 9. GraphQL-aware queries and mutations — #18
- Parse GraphQL documents.
- Identify operation type/name.
- Normalize formatting before matching.
- Include variables in deterministic identity.
- Preserve GraphQL partial-data/error responses.

### 10. GraphQL schema validation and mock generation — #24
- Load SDL and/or introspection schema data.
- Validate operations against the schema.
- Generate deterministic starter data for supported schema types.
- Detect obvious breaking schema changes.

**Exit condition:** GraphQL query/mutation record/replay is operation-aware and can optionally use schema information for validation and generation.

---

# Phase 5 — Real-time interactions / WebSockets

**Goal:** extend Atticus from request/response replay into deterministic replay of bidirectional sessions.

### 11. WebSocket session record/replay — #19
Start deliberately small:
- intercept configured `ws://` / `wss://` endpoints
- record ordered client/server frames
- persist a session transcript
- replay without the real backend
- validate expected client frames
- preserve close code/reason
- define explicit timing behavior

Do **not** attempt every fault/reconnect scenario in the first implementation.

### 12. WebSocket timing and fault simulation — #20
After basic replay is trustworthy, add opt-in deterministic behaviors such as:
- delayed messages
- duplicate messages
- dropped messages
- configured out-of-order delivery
- server disconnects
- mid-session interruption

### 13. GraphQL subscriptions over WebSocket — #21
Build GraphQL subscription semantics on top of the generic WebSocket transport/session model rather than creating a separate implementation.

**Exit condition:** Atticus can capture and deterministically replay ordinary WebSocket sessions, simulate selected real-time failure modes, and understand GraphQL subscriptions semantically.

---

# Phase 6 — Mock lifecycle and team-scale usage

**Goal:** allow mocks to become shared, reviewable test assets rather than local files that silently change.

### 14. Collections, revisions, approval, and diff workflow — #22
Introduce:
- collections
- revision metadata
- pending vs approved state
- request/response hashes
- `atticus list`
- `atticus diff`
- `atticus approve`
- `atticus collections`

### 15. Shared remote mock storage — #23
After the storage/lifecycle contracts stabilize:
- HTTP-backed shared storage first
- concurrency/version conflict rules
- safe authentication configuration
- evaluate S3-compatible storage as a later backend

File storage remains the default local experience.

**Exit condition:** teams and CI runners can consume shared approved mock collections without coupling Atticus to a specific remote storage technology.

---

# Phase 7 — Compatibility backlog

These features are valid extensions, but should not displace higher-value work without a real consumer need.

### 16. XML normalization / basic SOAP compatibility — #25
- Canonicalize XML for deterministic matching.
- Preserve namespaces and significant XML differences.
- Allow ordinary SOAP-over-HTTP traffic to benefit from generic HTTP record/replay.

Explicitly **not** an initial goal:
- complete WSDL tooling
- WS-Security
- exhaustive SOAP 1.1/1.2 behavior
- replacing dedicated SOAP testing platforms

SOAP-specific work should be driven by an actual use case after generic XML support exists.

---

# Suggested execution order

```text
#10 CI hardening
  -> #11 npm trusted publishing
  -> #12 README/docs
  -> #13 runnable example/package smoke test

#14 architecture separation
  -> #15 storage abstraction
  -> #16 matching/normalization

Then technical feature streams can proceed with fewer cross-cutting rewrites:

REST/OpenAPI:       #17
GraphQL HTTP:       #18 -> #24
WebSocket:          #19 -> #20
GraphQL realtime:   #18 + #19 -> #21
Mock lifecycle:     #15 -> #22 -> #23
Compatibility:      #16 -> #25
```

The first four issues are intentionally prioritized over new protocol work. Atticus should become easy to release and easy to adopt before it becomes broader.

---

# Long-term definition of done

Atticus reaches a credible `1.0` when:

- releases are automated and reproducible
- public APIs and compatibility expectations are documented
- consumer examples are continuously validated
- record/replay behavior is deterministic and diagnosable
- transport, matching, storage, and protocol semantics have clear boundaries
- REST/OpenAPI support is contract-aware
- GraphQL queries/mutations are operation-aware
- WebSocket sessions can be recorded and replayed deterministically
- mock revisions can be reviewed and approved
- storage can be local or shared without changing core behavior

`1.0` does **not** require every possible protocol. It requires a stable architecture and a trustworthy user experience for the protocols Atticus chooses to support.