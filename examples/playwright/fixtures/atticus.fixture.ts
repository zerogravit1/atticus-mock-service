import { test as base } from '@playwright/test';
import { MockService } from 'atticus-mock-service';
import path from 'path';
import fs from 'fs';

export const test = base.extend({
  page: async ({ page }, use) => {
    // determine mode
    console.log('running fixtures');
    const env = process.env.ATTICUS_MODE;
    const fileMode = fs.existsSync('.atticus-mode') ? fs.readFileSync('.atticus-mode', 'utf8').trim() : undefined;
    const mode = (env ?? fileMode ?? 'auto') as 'record' | 'replay' | 'auto';

    const service = new MockService({
      mockDir: path.resolve('atticus-mocks'),
      recordMode: mode,
      autoApprove: true
    });

    await service.attachToPage(page);

    await use(page);
  }
});
export { expect } from '@playwright/test';
