import { describe, test, expect } from 'vitest';
import * as bodyParser from '../../utils/body-parser.js';

describe('safeParseJson', () => {
  test('returns parsed object when JSON is valid', () => {
    const raw = '{"foo":"bar"}';
    const result = bodyParser.safeParseJson(raw);

    expect(result).toEqual({ foo: 'bar' });
  });

  test('returns undefined for invalid JSON', () => {
    const raw = '{"foo":'
    const result = bodyParser.safeParseJson(raw);

    expect(result).toBeUndefined();
  });
});

describe('parseBodyFromContentType', () => {
  test('returns empty rawBody and undefined parsedBody when raw is falsy', () => {
    const result = bodyParser.parseBodyFromContentType('application/json', '');

    expect(result.rawBody).toBe('');
    expect(result.parsedBody).toBeUndefined();
  });

  describe('application/json', () => {
    test('parses JSON body when valid', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/json',
        '{"a":1}'
      );

      expect(result.rawBody).toBe('{"a":1}');
      expect(result.parsedBody).toEqual({ a: 1 });
    });

    test('parses JSON ignoring header case and parameters', () => {
      const result = bodyParser.parseBodyFromContentType(
        'Application/Json; charset=utf-8',
        '{"a":1}'
      );

      expect(result.rawBody).toBe('{"a":1}');
      expect(result.parsedBody).toEqual({ a: 1 });
    });

    test('falls back to raw when JSON parse fails', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/json',
        '{"a":'
      );

      expect(result.rawBody).toBe('{"a":');
      expect(result.parsedBody).toBe('{"a":');
    });
  });

  describe('application/x-www-form-urlencoded', () => {
    test('parses URL-encoded bodies into an object', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/x-www-form-urlencoded',
        'foo=bar&baz=qux'
      );

      expect(result.rawBody).toBe('foo=bar&baz=qux');
      expect(result.parsedBody).toEqual({ foo: "bar", baz: "qux" });
    });

    test.skip('returns undefined parsedBody on invalid form payload', () => {
      const result = bodyParser.parseBodyFromContentType(
        'application/x-www-form-urlencoded',
        '&' // undefineable
      );

      expect(result.rawBody).toBe('&');
      expect(result.parsedBody).toBeUndefined();
    });
  });

  describe('other content types / undefined', () => {
    test('returns raw body and undefined parsedBody for text/plain', () => {
      const result = bodyParser.parseBodyFromContentType('text/plain', 'test');

      expect(result.rawBody).toBe('test');
      expect(result.parsedBody).toBeUndefined();
    });

    test('returns raw body and undefined parsedBody when content-type is undefined', () => {
      const result = bodyParser.parseBodyFromContentType(undefined, 'test');

      expect(result.rawBody).toBe('test');
      expect(result.parsedBody).toBeUndefined();
    });
  });
});
