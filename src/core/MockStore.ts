import fs from 'fs-extra';
import path from 'path';
import type { StoredResponse } from '../types.js';
import { logger } from '../utils/logger.js';

export class MockStore {
  readonly dir: string;

  constructor(dir = './atticus-mocks') {
    this.dir = path.resolve(dir);
    fs.ensureDirSync(this.dir);
  }

  private filePathForSignature(sig: string) {
    return path.join(this.dir, `${sig}.json`);
  }

  has(sig: string) {
    return fs.existsSync(this.filePathForSignature(sig));
  }

  read(sig: string): StoredResponse | null {
    const p = this.filePathForSignature(sig);
    if (!fs.existsSync(p)) return null;
    try {
      return fs.readJSONSync(p) as StoredResponse;
    } catch (err) {
      logger.error('Failed to read mock file', p, err);
      return null;
    }
  }

  save(sig: string, response: StoredResponse) {
    const p = this.filePathForSignature(sig);
    fs.writeJSONSync(p, response, { spaces: 2 });
    logger.info('Saved mock ->', p);
  }

  list(): string[] {
    const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.json'));
    return files.map(f => path.basename(f, '.json'));
  }
}
