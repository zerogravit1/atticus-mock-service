import crypto from 'crypto';

export function hashRequest(input: unknown): string {
  return crypto.createHash('sha256')
  .update(JSON.stringify(input))
  .digest('hex');
}