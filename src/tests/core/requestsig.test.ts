// import test from 'node:test';
// import assert from 'node:assert';
import { describe, test, beforeEach, expect } from 'vitest';

import { StoredRequestMeta } from '../../types.js';
import { buildSignature } from '../../core/RequestSignature.js';

test('buildSignature is deterministic for identical request meta', () => {
  const meta1 = {
    url: '/api/users',
    method: 'GET',
    rawBody: '',
    parsedBody: undefined,
  } as StoredRequestMeta;

  const meta2 = { ...meta1 };

  const sig1 = buildSignature(meta1);
  const sig2 = buildSignature(meta2);

  // assert.equal(sig1, sig2);
  expect(sig1).toBe(sig2);
});

test('buildSignature changes when url changes', () => {
  const base = {
    method: 'GET',
    rawBody: '',
    parsedBody: undefined,
  } as StoredRequestMeta;

  const sig1 = buildSignature({ ...base, url: '/api/users' });
  const sig2 = buildSignature({ ...base, url: '/api/accounts' });

  // assert.notEqual(sig1, sig2);
  expect(sig1).not.toBe(sig2);
});

test('buildSignature changes when body changes', () => {
  const base = {
    url: '/api/users',
    method: 'POST',
  } as StoredRequestMeta;

  const sig1 = buildSignature({
    ...base,
    rawBody: '{"a":1}',
    parsedBody: undefined
  });

  const sig2 = buildSignature({
    ...base,
    rawBody: '{"a":2}',
    parsedBody: undefined
  });

  // assert.notEqual(sig1, sig2);
  expect(sig1).not.toBe(sig2);
});

test('buildSignature uses parsedBody over rawBody when present', () => {
  const base = {
    url: 'api/users',
    method: 'POST',
    rawBody: '{"a":1}'
  } as StoredRequestMeta;

  const sigWithRawOnly = buildSignature({
    ...base,
    parsedBody: undefined
  });

  const sigWithParsed = buildSignature({
    ...base,
    parsedBody: { a: 1 },
  });

  // assert.notEqual(sigWithRawOnly, sigWithParsed);
  expect(sigWithRawOnly).not.toBe(sigWithParsed);
});

test('buildSignature ignores non-signature fields', () => {
  const base = {
    url: '/api/users',
    method: 'GET',
    rawBody: '',
    parsedBody: undefined,
  } as StoredRequestMeta;

  const sig1 = buildSignature({
    ...base,
    headers: {'x-request-id': '123' },
  } as StoredRequestMeta);

  const sig2 = buildSignature({
    ...base,
    headers: {'x-request-id': '456' },
  } as StoredRequestMeta);

  // assert.equal(sig1, sig2);
  expect(sig1).toBe(sig2);
});