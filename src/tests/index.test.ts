import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { MockStore } from '../../dist/core/MockStore.js';

const tmpDir = path.resolve('./tmp-mocks-test');
fs.rmSync(tmpDir, { recursive: true, force: true });

const store = new MockStore(tmpDir);
const sig = 'abc123';
const data = { status: 200, headers: {}, body: 'ok' };
store.save(sig, data);
assert.ok(fs.existsSync(path.join(tmpDir, `${sig}.json`)));
