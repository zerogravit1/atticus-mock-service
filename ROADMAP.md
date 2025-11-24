# Atticus Mock Service
## Roadmap & Architecture Guide

This document captures the long‑term vision, architectural direction, and upcoming work for **Atticus Mock Service**. This serves as a canonical reference for contributors and maintainers.

---

# 📌 Overview
Atticus is a Playwright-first HTTP record/replay framework designed for:
- Deterministic testing
- Contract stability
- API evolution safety
- Versioned mocking workflows
- Centralized and distributed mock storage
- OpenAPI-driven mock generation

This roadmap moves Atticus from its minimal v0.1.0 release into a mature, production-grade testing platform.

---

# 🗺️ Roadmap (High-Level)

## Phase 1 — Foundation (Reliability & Trust)
### ✔ Unit Tests & Coverage
- Node test-based unit tests for core modules
- Coverage reporting using `c8`
- CI enforcement of passing tests
- High coverage targets for core logic

### ✔ Documentation & Examples
- Rewrite README with Quickstart, FAQ, Troubleshooting
- Add `examples/playwright-basic` using the published package
- Add `examples/playwright-openapi` (after swagger support)

---

## Phase 2 — Architecture & Structure
### ✔ Internal Architecture Separation
Introduce a clean modular directory structure:
```
src/
  core/            # Orchestrators (MockService)
  storage/         # Implementations of MockStorage
  matching/        # Hashing, normalization, signatures
  openapi/         # Swagger/OpenAPI processors
  cli/             # Future CLI commands
  utils/           # Helpers, hashing, safe parsing
```

### ✔ Public API Definition
- Stabilize exported surface area
- Internal vs external modules
- Ensure backwards compatibility across versions

---

## Phase 3 — Storage Abstraction & Centralization
### ✔ Add MockStorage interface
Allow different backends:
- `FileStorage` (default)
- `HttpStorage` (centralized server)
- `S3Storage` / `GCSStorage`
- `InMemoryStorage` for tests

### ✔ Remote/central mock repository
Add optional centralized shared mocks across:
- Multiple test runners
- Multiple repos / teams
- CI pipelines

Storage configuration example:
```ts
storage: 'file' | 'http' | 'custom',
storageConfig: { baseUrl?: string },
storageFactory?: () => MockStorage;
```

---

## Phase 4 — Mock Version Control & Promotion
Introduce first-class concepts:
- **Collections**: logical grouping of mocks (e.g., "users-v1", "checkout-v3")
- **Revisions**: auto-increment versions of the collection
- **Approval Flow**: compare unapproved → approved mocks

Metadata design:
```ts
interface MockMetadata {
  key: string;
  collection: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  approved: boolean;
  hashRequest: string;
  hashResponse: string;
}
```

CLI commands (future):
```
atticus list
atticus diff
atticus approve
atticus collections
```

---

## Phase 5 — OpenAPI/Swagger Mock Generation
### ✔ Parse OpenAPI/Swagger
- Load `.json` or `.yaml` OpenAPI files
- Map routes & methods → mock templates

### ✔ Auto-generate boilerplate mocks
Use examples from spec (if available) or generate reasonable defaults.

### Later enhancements:
- Validate recorded responses against schema
- Warn on breaking API changes
- Offer type-safe client stubs

---

# 🧱 Architecture Overview

## 1. Core Components
### **MockService**
The orchestrator. Responsibilities:
- Attach to Playwright `page`
- Intercept routes
- Route to record/replay logic
- Communicate with storage layer
- Apply matching/signature logic

### **MockStore → MockStorage**
MockStore becomes a thin adapter around MockStorage.
MockStorage interface allows:
```ts
load(key: string): Promise<StoredMock | null>;
save(key: string, mock: StoredMock): Promise<void>;
list(prefix?: string): Promise<string[]>;
```

Current implementation:
- `FileStorage`: stores mocks as JSON files

Future:
- `HttpStorage`: central repository
- `S3Storage`: bucket-based mocks
- `CustomStorage` via factory function

---

## 2. Request Matching Layer
`matching/RequestSignature.ts` handles:
- URL normalization
- Method normalization
- Body hashing & canonicalization
- Header filtering (optional)

Goal: deterministic signature generation.

---

## 3. OpenAPI Layer
`openapi/OpenApiLoader.ts` handles loading the spec.

`OpenApiMockGenerator.ts` produces seed mock files using the schema.

Long-term: diff actual mocks vs OpenAPI docs.

---

## 4. CLI Layer
`cli/` will expose:
- `atticus diff`
- `atticus approve`
- `atticus collections`
- `atticus list`

This allows teams to:
- Approve mock changes locally or in CI
- Detect API drift
- Promote mocks between collections

---

# 🏗️ Design Principles

### 1. **Clear separation of operational vs control-plane concerns**
- Runtime recording/replay stays lightweight (no heavy coupling)
- Control-plane features (versioning, approvals) live separately

### 2. **Pluggable everything**
- Storage backends
- Matching strategies
- OpenAPI loaders
- CLI behavior

### 3. **Deterministic and predictable behavior**
- Same inputs produce the same outputs
- Transparent metadata
- Debuggable signatures

### 4. **Backwards compatibility**
- Avoid breaking existing mocks
- Provide migrations when needed

### 5. **Modular expansion without rewriting the core**
- v0.1.0 stays valid and simple
- v1+ grows around it, not through it

---

# 🚀 Next Steps
1. Add unit tests & coverage
2. Build first example project under `/examples/playwright-basic`
3. Introduce MockStorage interface (no behavior changes)
4. Create docs under `/docs` directory
5. Build OpenAPI loader foundation
6. Begin version/approval metadata design

---

# 📎 Summary
Atticus now has a clear path from a minimal record/replay service to a fully featured API mock lifecycle ecosystem.

This file serves as the living source of truth.

