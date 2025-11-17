#!/usr/bin/env node

import { MockStore } from '../core/MockStore.js';
import { argv } from 'process';

const cmd = argv[2] ?? 'list';
const dir = argv[3] ?? './atticus-mocks';
const store = new MockStore(dir);

switch (cmd) {
  case 'list': {
    const list = store.list();
    console.table(list);
    break;
  }
  default:
    console.log('Usage: atticus <list> [mockDir]');
}