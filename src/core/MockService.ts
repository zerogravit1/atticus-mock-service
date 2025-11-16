import type { Page } from 'playwright-core';
import { MockStore } from './MockStore.js';
import { parseBody } from '../utils/body-parser.js';
import { logger } from '../utils/logger.js';
import type { StoredRequest } from '../types.js';
import { buildSignature } from './RequestSignature.js';

export class MockService {
  constructor(private page: Page, private store: MockStore, private mode: 'record' | 'replay' | 'auto') {}

  async setup() {
    await this.page.route('**/*', async (route) => {
      const req = route.request();
      const contentType = req.headers()['content-type'] ?? '';
      const rawBody = req.postData() ?? '';

      const requestObject: StoredRequest = {
        url: req.url(),
        method: req.method(),
        headers: req.headers(),
        rawBody,
        parsedBody: parseBody(contentType, rawBody),
        signature: ''
      };

      requestObject.signature = buildSignature(requestObject);

      const existing = this.store.read(requestObject.signature);

      if (existing && (this.mode === 'replay' || this.mode === 'auto')) {
        logger.info(`Replaying mock: ${req.url()}`);
        return route.fulfill(existing);
      }

      // NOT SURE ABOUT THIS CHECK, may switch to continue
      if (this.mode === 'replay') {
        logger.warn(`Missing mock for ${req.url()}`);
        return route.abort();
      }

      logger.info(`Recording new request: ${req.url()}`);

      let realResponse;
      try {
        realResponse = await route.fetch();
      } catch (err) {
        logger.error('HTTPS fetch failed:', err);
        return route.abort();
      }

      const body = await realResponse.text();

      const stored = {
        status: realResponse.status(),
        headers: realResponse.headers(),
        body
      };

      this.store.save(requestObject, stored);

      return route.fulfill(stored);
    });
  }
}
