/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Route, Request as PWRequest, Page } from 'playwright-core';
import type { AtticusOptions, StoredRequestMeta, StoredResponse } from '../types.js';
import { MockStore } from './MockStore.js';
import { parseBodyFromContentType, safeParseJson } from '../utils/body-parser.js';
import { hashObject } from '../utils/hash.js';
import { logger } from '../utils/logger.js';

export class MockService {
  private store: MockStore;

  private mode: 'record' | 'replay' | 'auto';

  private autoApprove: boolean;

  constructor(private opts: AtticusOptions) {
    this.store = new MockStore(opts.mockDir ?? './atticus-mocks');
    this.mode = opts.recordMode ?? 'auto';
    this.autoApprove = opts.autoApprove ?? false;
  }

  /**
   * Attach the mock service to a Page.
   * Call once per page inside a Fixture
   */
  async attachToPage(page: Page) {
    // Intercept all network requests;
    await page.route('**/*', async (route: Route) => {
      const request = route.request();
      
      try {
        const handled = await this.handleRoute(route, request);
        if (!handled) {
          await route.continue();
        }
      } catch (err) {
        logger.error('Error handling route', err);

        try {
          await route.continue();
        } catch (e) {
          logger.error('route.continue failed', e);
          await route.abort();
        }
      }
    });
  }

  private async handleRoute(route: Route, request: PWRequest): Promise<boolean> {
    const resourceType = request.resourceType();
    if (resourceType === 'document' || resourceType === 'script' || resourceType === 'stylesheet' || resourceType === 'image') {
      return false
    }

    const url = request.url();
    const method = request.method();
    const headers = request.headers();
    const contentType = headers['content-type'] ?? headers['Content-Type'] ?? '';
    const rawBody = request.postData() ?? '';

    const { rawBody: rb, parsedBody } = parseBodyFromContentType(contentType, rawBody);

    const signature = hashObject({
      method,
      url,
      body: parsedBody ?? rb
    });

    const meta: StoredRequestMeta = {
      url,
      method,
      headers,
      rawBody: rb,
      parsedBody,
      signature,
      timestamp: new Date().toISOString()
    };

    const existing = this.store.read(signature);

    if (existing && (this.mode === 'replay' || this.mode === 'auto')) {
      logger.info('Atticus: replay', method, url);
      await route.fulfill({
        status: existing.status,
        headers: existing.headers,
        body: existing.body
      });
      return true;
    }

    if (this.mode === 'replay') {
      logger.warn('Atticus: missing mock in replay mode for', method, url);

      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Atticus missing mock', method, url })
      });
      return true;
    }

    logger.info('Atticus: recording', method, url);

    let realResponse;

    try {
      realResponse = await route.fetch();
    } catch (err: unknown) {
      if (err instanceof Error) {
        logger.error('route.fetch() failed:', err && err.message ? err.message : err);
      }
      throw err;
    }

    // capture body text
    const body = await realResponse.text();
    const stored: StoredResponse = {
      status: realResponse.status(),
      headers: realResponse.headers(),
      body
    };

    // save mock
    if (this.autoApprove) {
      this.store.save(signature, stored);
    } else {
      // pending
      this.store.save(signature, stored);
    }

    // fulfill and continue
    await route.fulfill({
      status: stored.status,
      headers: stored.headers,
      body: stored.body
    });

    return true
  }

  approve(signature: string) {
    // for future approval process
    logger.info('approve called for', signature);
  }

  listMocks() {
    return this.store.list();
  }
}
