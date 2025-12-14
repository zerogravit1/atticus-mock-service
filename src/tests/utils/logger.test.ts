// import test from 'node:test';
// import assert from 'node:assert/strict';
import { describe, test, beforeEach, expect } from 'vitest';
import { logger } from '../../utils/logger.js';

test('logger.info uses console.log with Atticus prefix', () => {
  const original = console.log;
  const calls: unknown[][] = [];

  console.log = (...args: unknown[]) => {
    calls.push(args);
  };

  try {
    logger.info('hello', 123);

    expect(calls.length).toBe(1);
    const [prefix, ...rest] = calls[0];

    expect(prefix).toBe('🟦 [Atticus]');
    expect(rest).toEqual(['hello', 123]);
  } finally {
    console.log = original;
  }
});

test('logger.warn uses console.warn with Atticus prefix', () => {
  const original = console.warn;
  const calls: unknown[][] = [];

  console.warn = (...args: unknown[]) => {
    calls.push(args);
  };

  try {
    logger.warn('careful', { foo: 'bar' });

    expect(calls.length).toBe(1);
    const [prefix, ...rest] = calls[0];

    expect(prefix).toBe('🟨 [Atticus]');
    expect(rest).toEqual(['careful', { foo: 'bar' }]);
  } finally {
    console.warn = original;
  }
});

test('logger.error uses console.error with Atticus prefix', () => {
  const original = console.error;
  const calls: unknown[][] = [];

  console.error = (...args: unknown[]) => {
    calls.push(args);
  };

  try {
    const err = new Error('boom');
    logger.error('failed', err);

    expect(calls.length).toBe(1);
    const [prefix, ...rest] = calls[0];

    expect(prefix).toBe('🟥 [Atticus]');
    expect(rest).toEqual(['failed', err]);
  } finally {
    console.error = original;
  }
});

test('logger.success uses console.log with Atticus prefix', () => {
  const original = console.log;
  const calls: unknown[][] = [];

  console.log = (...args: unknown[]) => {
    calls.push(args);
  };

  try {
    logger.success('all good');

    expect(calls.length).toBe(1);
    const [prefix, ...rest] = calls[0];

    expect(prefix).toBe('🟩 [Atticus]')
    expect(rest).toEqual(['all good'])
  } finally {
    console.log = original;
  }
});
