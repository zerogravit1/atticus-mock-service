Playwright-first API mock recorder/replayer (Atticus).

## Quick start

Install (dev):

```bash
npm install --save-dev atticus-mock-service
```

Add to Playwright fixtures (example):

```ts
import { test as base } from '@playwright/test';
import { MockService } from 'atticus-mock-service';
import path from 'path';

export const test = base.extend({
  page: async ({ page }, use) => {
    const service = new MockService({
      mockDir: path.resolve('atticus-mocks'),
      recordMode: 'auto',
      autoApprove: true
    });
    await service.attachToPage(page);
    await use(page);
  }
});
export { expect } from '@playwright/test';
```

Modes:

- `record` — always hit real endpoints and save responses  
- `replay` — only use saved responses; fail if missing  
- `auto` — replay if present; otherwise record

Notes:
- If you see TLS errors for `route.fetch()`, set `NODE_EXTRA_CA_CERTS` to a CA file you trust and set `ignoreHTTPSErrors: true` in Playwright config.

Contributing and publishing:
- repo contains `ci` workflow that runs lint/build/test on PRs.
