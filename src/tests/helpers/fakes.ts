import { Request as PWRequest, Route } from 'playwright-core';
import type { StoredResponse } from '../../types';

type FakeRequestOverrides = Partial<
  Pick<PWRequest, 'resourceType' | 'url' | 'method' | 'headers' | 'postData'>
>;

type FakeResponse = Pick<
  Awaited<ReturnType<Route['fetch']>>,
  'status' | 'headers' | 'text'
>;

export type FulfillOptions = Exclude<
  Parameters<Route['fulfill']>[0],
  undefined
>;

type FakeRouteOverrides = {
  request?: () => PWRequest;
  fetch?: () => Promise<FakeResponse>;
  fulfill?: (args: FulfillOptions) => Promise<void>;
  continue?: () => Promise<void>;
  abort?: () => Promise<void>;
}

export function createFakeRequest(
  overrides: FakeRequestOverrides = {},
): PWRequest {
  return {
    resourceType: () => 'fetch',
    url: () => 'https://examples.com/api/users',
    method: () => 'GET',
    headers: () => ({ 'content-type': 'application/json' }),
    postData: () => '',
    ...overrides,
  } as unknown as PWRequest;
}

export function createFakeRoute(
  overrides: FakeRouteOverrides = {},
): Route {
  let fulfilledArgs: FulfillOptions | null = null;

  const base = {
    request: () => createFakeRequest(),
    async fetch(): Promise<FakeResponse> {
      return {
        status: () => 200,
        headers: () => ({ 'content-type': 'application/json' }),
        text: async () => '{"ok":true}',
      };
    },

    async fulfill(args: FulfillOptions) {
      fulfilledArgs = args;
    },

    async continue() {
      return undefined;
    },

    async abort() {
      return undefined;
    },

    get fulfilled() {
      return fulfilledArgs;
    },
  };

  return { ...base, ...overrides } as unknown as Route;
}

export function createFakeStore() {
  const mocks = new Map<string, StoredResponse>();

  return {
    read: (sig: string) => mocks.get(sig) ?? null,

    save: (sig: string, res: StoredResponse) => {
      mocks.set(sig, res);
    },

    list: () => Array.from(mocks.keys()),

    size: () => mocks.size,
  };
}
