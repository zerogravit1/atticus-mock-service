import fs from 'fs-extra';
import { StoredRequest, StoredResponse } from '../types.js';
import { buildSignature } from './RequestSignature.js';

export class MockStore {
  constructor(private dir: string) {}

  private getPath(sig: string) {
    return `${this.dir}/${sig}.json`;
  }

  has(sig: string): boolean {
    return fs.existsSync(this.getPath(sig));
  }

  read(sig: string): StoredResponse | null {
    if (!this.has(sig)) return null;
    return fs.readJSONSync(this.getPath(sig));
  }

  save(req: StoredRequest, res: StoredResponse) {
    const path = this.getPath(req.signature);

    fs.ensureDirSync(this.dir);
    fs.writeJSONSync(path, res, { spaces: 2 });
  }
}
