// import type { Request as PWRequest, Route } from 'playwright-core';
import type { StoredResponse } from '../../types';

export function createFakeRequest(
  overrides: Partial<{
    resourceType: () => string;
    url: () => string;
    method: () => string;
    headers: () => Record<string, string>;
    postData: () => string | null;
  }> = {},
): any {
  return {
    resourceType: () => 'fetch',
    url: () => 'https://examples.com/api/users',
    method: () => 'GET',
    headers: () => ({ 'content-type': 'application/json' }),
    postData: () => '',
    ...overrides,
  };
}

export function createFakeRoute(
  overrides: Partial<{
    fetch: (...args: any[]) => Promise<any>;
    fulfill: (args: any) => Promise<void>;
    continue: () => Promise<void>;
    abort: () => Promise<void>;
  }> = {},
): any {
  let fulfilledArgs: any = null;

  const base = {
    async fetch() {
      return {
        status: () => 200,
        headers: () => ({ 'content-type': 'application/json' }),
        text: async () => '{"ok":true}',
      };
    },
    async fulfill(args: any) {
      fulfilledArgs = args;
    },
    async continue() {},
    async abort() {},
    get fulfilled() {
      return fulfilledArgs;
    },
  };

  return { ...base, ...overrides };
}

export function createFakeStore() {
  const mocks = new Map<string, StoredResponse>();

  return {
    read: (sig: string) => mocks.get(sig) ?? null,
    save: (sig: string, res: StoredResponse) => {
      mocks.set(sig, res);
    },
    list: () => Array.from(mocks.keys()),
    _mocks: mocks,
  };
}
