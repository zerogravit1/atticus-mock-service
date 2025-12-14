import { describe, test, expect } from 'vitest';

import * as bodyParser from '../../utils/body-parser.js';

// tests for safeparsejson

test('safeParseJson should return parsed json', () => {
  const raw = '{"foo":"bar"}'
  const result = bodyParser.safeParseJson(raw);

  expect(result).toEqual({ foo: 'bar' });
});

test('safeParseJson should return undefined', () => {
  const raw = '{"foo":'
  const result = bodyParser.safeParseJson(raw);

  expect(result).toEqual(undefined);
});

// tests for parseBodyFromContentType

test('when raw input is falsy', () => {
  const result = bodyParser.parseBodyFromContentType('application/json', '');

  expect(result.rawBody).toBe('');
  expect(result.parsedBody).toBe(undefined);
});

describe('content-type', () => {
  describe('when parsing application/json', () => {
    test('is successful', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/json',
        '{"a":1}'
      );

      expect(result.rawBody).toBe('{"a":1}');
      expect(result.parsedBody).toEqual({ a: 1 });
    });

    test('is successful with mixed case', () => {
      const result = bodyParser.parseBodyFromContentType(
        'Application/Json',
        '{"a":1}'
      );

      expect(result.rawBody).toBe('{"a":1}');
      expect(result.parsedBody).toEqual({ a: 1 });
    });

    test('fails to parse', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/json',
        '{"a":'
      );

      expect(result.rawBody).toBe('{"a":');
      expect(result.parsedBody).toBe('{"a":');
    });
  });

  describe('when parsing application/x-www-form-urlencoded', () => {
    test('is successful', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/x-www-form-urlencoded',
        'foo=bar&baz=qux'
      );

      expect(result.rawBody).toBe('foo=bar&baz=qux');
      expect(result.parsedBody).toEqual({ foo: "bar", baz: "qux" });
    });

    test.skip('fails to parse', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/x-www-form-urlencoded',
        '&' // undefineable
      );

      expect(result.rawBody).toBe('&');
      expect(result.parsedBody).toEqual(undefined);
    });
  });

  describe('undefined', () => {
    test('falls back to raw only when text/plain', () => {
      const result = bodyParser.parseBodyFromContentType('text/plain', 'test');

      expect(result.rawBody).toBe('test');
      expect(result.parsedBody).toBe(undefined);
    });

    test('falls back to raw only when undefined', () => {
      const result = bodyParser.parseBodyFromContentType(undefined, 'test');

      expect(result.rawBody).toBe('test');
      expect(result.parsedBody).toBe(undefined);
    });
  });
});