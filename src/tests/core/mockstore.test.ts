import { test, expect } from 'vitest';
import fs from 'node:fs/promises';
import nodeFs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { MockStore } from '../../core/MockStore.js';
import { logger } from '../../utils/logger.js';

test('MockStore returns file path', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
  const store = new MockStore(tmpDir);
  const sig = 'test-signature-001';

  const expectedPath = path.join(tmpDir, `${sig}.json`);
  nodeFs.writeFileSync(expectedPath, '{"status":200}');

  // assert.equal(store.has(sig), true);
  expect(store.has(sig)).toBe(true);

  // assert.equal(store.has('other-sig'), false);
  expect(store.has('other-sig')).toBe(false);
});

test('MockStore writes and reads mocks from disk', async () => {
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

  // assert.deepEqual(loaded, mock);
  expect(loaded).toEqual(mock);
});

test('MockStore fails to read mock from disk', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
  const store = new MockStore(tmpDir);
  const sig = 'test-signature-003';

  const loaded = store.read(sig);

  // assert.deepEqual(loaded, null);
  expect(loaded).toEqual(null);
});

test('MockStore returns null and logs error on corrupt JSON', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atticus-test-'));
  const store = new MockStore(tmpDir);
  const sig = 'corrupt-json-sig';

  const filePath = path.join(tmpDir, `${sig}.json`);
  
  nodeFs.writeFileSync(filePath, '{ this is not valid JSON');

  const originalError = logger.error;
  let loggedArgs: unknown[] | null = null;

  logger.error = (...args: unknown[]) => {
    loggedArgs = args;
  };

  const loaded = store.read(sig);

  // Restore logger
  logger.error = originalError;

  // assert.equal(loaded, null);
  expect(loaded).toBe(null)
  // assert.ok(loggedArgs, 'logger.error should have been called');
  expect(loggedArgs, 'logger.error should have been called').toBeTruthy();
  // assert.equal(loggedArgs?.[0], 'Failed to read mock file');
  expect(loggedArgs?.[0]).toBe('Failed to read mock file');
});

test('MockStore lists mocks from disk', async () => {
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

  // assert.deepEqual(list, [sig]);
  expect(list).toEqual([sig]);
});
