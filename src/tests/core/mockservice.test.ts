import { describe, test, beforeEach, expect } from 'vitest';
import { MockService } from '../../core/MockService.js';
import type { AtticusOptions, StoredResponse } from '../../types';
import { createFakeStore, createFakeRoute, createFakeRequest } from '../helpers/fakes.js'
import { logger } from '../../utils/logger.js';

type RouteHandler = (route: any) => Promise<void>;

let service: MockService;
let fakeStore: ReturnType<typeof createFakeStore>;

describe('MockService', () => {
  describe('attachToPage', () => {
    test('registers route and calls handleRoute, continuing when not handled', async () => {
      const service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused',
      } as AtticusOptions);

      let registeredPattern: string | null = null;
      let registeredHandler: RouteHandler | null = null;

      const fakePage = {
        route: async (pattern: string, handler: RouteHandler) => {
          registeredPattern = pattern;
          registeredHandler = handler;
        },
      };

      let handleRouteCalled = false;
      (service as any).handleRoute = async () => {
        handleRouteCalled = true;
        return false;
      };

      await service.attachToPage(fakePage as any);

      expect(registeredPattern).toBe('**/*');
      expect(registeredHandler, 'route handler should be registered').toBeTruthy();

      let continued = false;
      const fakeRoute = {
        request: () => createFakeRequest(),
        continue: async () => {
          continued = true;
        },
      };

      await registeredHandler!(fakeRoute);

      expect(handleRouteCalled).toBe(true);
      expect(continued).toBe(true);
    });

    test('logs and continues when handleRoute throws', async () => {
      const service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused',
      } as AtticusOptions);

      let registeredHandler: RouteHandler | null = null;
      const fakePage = {
        route: async (_pattern: string, handler: RouteHandler) => {
          registeredHandler = handler;
        },
      };

      (service as any).handleRoute = async () => {
        throw new Error('fail');
      };

      let continued = false;
      let aborted = false;

      const fakeRoute = {
        request: () => createFakeRequest(),
        continue: async () => { continued = true; },
        abort: async () => { aborted = true; },
      };

      await service.attachToPage(fakePage as any);

      await registeredHandler!(fakeRoute);

      expect(continued).toBe(true);
      expect(aborted).toBe(false);
    });

    test('aborts when handleRoute and continue both fail', async () => {
      const service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused',
      } as AtticusOptions);

      let registeredHandler: RouteHandler | null = null;
      const fakePage = {
        route: async (_pattern: string, handler: RouteHandler) => {
          registeredHandler = handler;
        },
      };

      (service as any).handleRoute = async () => {
        throw new Error('fail');
      };

      let continued = false;
      let aborted = false;

      const fakeRoute = {
        request: () => createFakeRequest(),
        continue: async () => {
          continued = true;
          throw new Error('continue failed');
        },
        abort: async () => { aborted = true; },
      };

      await service.attachToPage(fakePage as any);
      await registeredHandler!(fakeRoute);

      expect(continued).toBe(true);
      expect(aborted).toBe(true);
    });

    test('rethrows when route.fetch fails in record/auto mode', async () => {
      const service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused',
      } as AtticusOptions);

      const store = {
        read: () => null,
        save: () => {},
        list: () => [],
      };
      (service as any).store = store;

      const route = createFakeRoute({
        fetch: async () => {
          throw new Error('network failed');
        },
      });

      const request = createFakeRequest();

      await expect((service as any).handleRoute(route, request)).rejects.toThrow(/network failed/);
    });
  });

  describe('handleRoute', () => {
    beforeEach(() => {
      service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused'
      } as AtticusOptions);

      fakeStore = createFakeStore();

      (service as any).store = fakeStore;
    });

    const staticTypes = ['document', 'script', 'stylesheet', 'image'] as const;

    for (const type of staticTypes) {
      test(`skips ${type} requests`, async () => {
        let fulfilled = false;

        const route = createFakeRoute({
          fulfill: async () => { fulfilled = true; },
        });

        const request = createFakeRequest({
          resourceType: () => type,
        });

        const handled = await (service as any).handleRoute(route, request);

        expect(handled).toBe(false);
        expect(fulfilled).toBe(false);
        expect(fakeStore._mocks.size).toBe(0);
      });
    }

    test('replays stored mock in replay mode when a mock exists', async () => {
      const stored: StoredResponse = {
        status: 201,
        headers: { 'content-type': 'application/json' },
        body: '{"ok":true}',
      };

      service = new MockService({
        recordMode: 'replay',
        mockDir: 'unused',
      } as AtticusOptions);

      const store = {
        read: () => stored,
        save: () => {},
        list: () => [],
      };
      (service as any).store = store;

      let fulfilledArgs: any = null;
      const route = createFakeRoute({
        fulfill: async (args: any) => { fulfilledArgs = args; },
        fetch: async () => { throw new Error('fetch should not be called in replay mode when mock exists'); },
      });

      const request = createFakeRequest({
        method: () => 'GET',
        url: () => 'https://example.com/api/users',
      });

      const handled = await (service as any).handleRoute(route, request);

      expect(handled).toBe(true);
      expect(fulfilledArgs).toEqual(stored);
    });

    test('replays stored mock in auto mode when a mock exists', async () => {
      const stored: StoredResponse = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: '{"Cached":true}',
      };

      const store = {
        read: () => stored,
        save: () => {},
        list: () => [],
      };
      (service as any).store = store;

      let fulfilledArgs: any = null;
      const route = createFakeRoute({
        fulfill: async (args: any) => { fulfilledArgs = args; },
        fetch: async () => { throw new Error('fetch should not be called whe mock exists in auto mode')},
      });

      const request = createFakeRequest({
        method: () => 'GET',
        url: () => 'https://example.com/api/users',
      });

      const handled = await (service as any).handleRoute(route, request);

      expect(handled).toBe(true);
      expect(fulfilledArgs).toEqual(stored);
    });

    test('returns 500 when mock is missing in replay mode and does not call fetch', async () => {
      const service = new MockService({
        recordMode: 'replay',
        mockDir: 'unused'
      } as AtticusOptions);

      const fakeStore = {
        read: () => null,
        save: () => {},
        list: () => [],
      };

      (service as any).store = fakeStore;

      let fulfilledArgs: any = null;
      const route = createFakeRoute({
        fulfill: async (args: any) => { fulfilledArgs = args; },
        fetch: async () => { throw new Error('fetch should not be called in replay mode'); },
      });

      const request = createFakeRequest({
        method: () => 'GET',
        url: () => 'https://example.com/api/users',
      });

      const handled = await (service as any).handleRoute(route, request);

      expect(handled).toBe(true);
      expect(fulfilledArgs.status).toBe(500);

      const body = JSON.parse(fulfilledArgs.body);

      expect(body.error).toBe('Atticus missing mock');
      expect(body.method).toBe('GET');
      expect(body.url).toBe('https://example.com/api/users');
    });

    test('triggers live fetch and recording into auto mode when mock is missing', async () => {
      const service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused',
      } as AtticusOptions);

      const saved: { sig?: string; res?: StoredResponse } = {};
      const store = {
        read: () => null,
        save: (sig: string, res: StoredResponse) => {
          saved.sig = sig;
          saved.res = res;
        },
        list: () => [],
      };
      (service as any).store = store;

      let fulfilledArgs: any = null;

      const route = createFakeRoute({
        fetch: async () => ({
          status: () => 201,
          headers: () => ({ 'content-type': 'application/json' }),
          text: async () => '{"ok":true}',
        }),
        fulfill: async (args: any) => { fulfilledArgs = args; },
      });

      const request = createFakeRequest({
        method: () => 'POST',
        url: () => 'https://example.com/api/users',
      });

      const handled = await (service as any).handleRoute(route, request);

      expect(handled).toBe(true);

      expect(saved.res, 'expected store.save to be called').toBeTruthy();
      expect(saved.res!.status).toBe(201);
      expect(saved.res!.headers).toEqual({ 'content-type': 'application/json' });
      expect(saved.res!.body).toBe('{"ok":true}');

      expect(fulfilledArgs.status).toBe(201);
      expect(fulfilledArgs.body).toBe('{"ok":true}');
    });
  });

  describe('helpers', () => {
    test('listMocks proxies to store.list', () => {
      const service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused',
      } as AtticusOptions)

      const store = {
        read: () => null,
        save: () => {},
        list: () => ['sig-1', 'sig-2'],
      };
      (service as any).store = store;

      const result = service.listMocks();

      expect(result).toEqual(['sig-1', 'sig-2']);
    });

    test('approve logs the signature and does not throw', () => {
      const service = new MockService({
        recordMode: 'auto',
        mockDir: 'unused',
      } as AtticusOptions);

      const originalInfo = logger.info;
      const calls: unknown[][] = [];

      logger.info = (...args: unknown[]) => {
        calls.push(args);
      };

      try {
        service.approve('test-signature');

        expect(calls.length).toBe(1);
        expect(calls[0][0]).toBe('approve called for');
        expect(calls[0][1]).toBe('test-signature');
      } finally {
        logger.info = originalInfo;
      }
    });
  });
});



