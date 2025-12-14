import { describe, test, expect } from 'vitest';
import { hashObject } from '../../utils/hash.js';

describe('hashObject', () => {
  test('produces the same hash for objects with the same keys and values', () => {
    const a = { foo: 'bar', baz: 123 };
    const b = { baz: 123, foo: 'bar' }; // same keys different order
    const hashA = hashObject(a);
    const hashB = hashObject(b);

    expect(hashA).toBe(hashB);
  });

  test('should differ for different objects', () => {
    const a = { foo: 'bar' };
    const b = { foo: 'baz' };
    const hashA = hashObject(a);
    const hashB = hashObject(b);

    expect(hashA).not.toBe(hashB);
  });

  test('produce a 64-character hex string', () => {
    const hash = hashObject({ foo: 'bar' });

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
