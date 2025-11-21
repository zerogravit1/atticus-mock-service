/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This any is ok for now
 */
import crypto from 'crypto';

export function hashObject(input: unknown): string {
  const json = JSON.stringify(input, Object.keys(input as any).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
}