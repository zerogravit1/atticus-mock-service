import { describe, test, expect } from 'vitest';
import fs from 'node:fs/promises';
import nodeFs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { MockStore } from '../../core/MockStore.js';
import type { StoredResponse } from '../../types.js';
import { logger } from '../../utils/logger.js';

describe('MockStore', () => {
  test('has() reflects presence/absence of a mock file', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
    const store = new MockStore(tmpDir);
    const sig = 'test-signature-001';
    const filePath = path.join(tmpDir, `${sig}.json`);

    nodeFs.writeFileSync(filePath, '{"status":200}');

    expect(store.has(sig)).toBe(true);
    expect(store.has('other-sig')).toBe(false);
  });

  test('save() and read() round-trip a stored response', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
    const store = new MockStore(tmpDir);
    const sig = 'test-signature-002';

    const mock = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"ok":true}'
    };

    store.save(sig, mock)
    const loaded = store.read(sig);

    expect(loaded).toEqual(mock);
  });

  test('read() returns null when file is missing', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
    const store = new MockStore(tmpDir);
    const loaded = store.read('nonexistent-sig');

    expect(loaded).toEqual(null);
  });

  test('read() logs and returns null on corrupt JSON', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
    const store = new MockStore(tmpDir);
    const sig = 'corrupt-json-sig';
    const filePath = path.join(tmpDir, `${sig}.json`);
    
    nodeFs.writeFileSync(filePath, '{ this is not valid JSON');

    const originalError = logger.error;
    let loggedArgs: unknown[] | null = null;

    logger.error = (...args: unknown[]) => { loggedArgs = args; };

    const loaded = store.read(sig);
    
    logger.error = originalError;

    expect(loaded).toBeNull();
    expect(loggedArgs).toBeTruthy();
    expect(loggedArgs?.[0]).toBe('Failed to read mock file');
  });

  test('list() returns a list of signatures', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
    const store = new MockStore(tmpDir);
    const sig = 'test-signature-004';

    const mock = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"ok":true}'
    };

    store.save(sig, mock);

    const list = store.list();

    expect(list).toEqual([sig]);
  });
});










