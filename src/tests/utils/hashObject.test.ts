import { test, expect } from 'vitest';

import { hashObject } from '../../utils/hash.js';

test('hashObject should be deterministic for the same object', () => {
  const a = { foo: 'bar', baz: 123 };
  const b = { baz: 123, foo: 'bar' }; // same keys different order
  const hashA = hashObject(a);
  const hashB = hashObject(b);

  expect(hashA).toBe(hashB);
});

test('hashObject should differ for different objects', () => {
  const a = { foo: 'bar' };
  const b = { foo: 'baz' };
  const hashA = hashObject(a);
  const hashB = hashObject(b);

  expect(hashA).not.toBe(hashB);
});