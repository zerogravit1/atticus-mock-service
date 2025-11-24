#!/usr/bin/env node
/* eslint-disable no-console */
import { argv } from 'process';
import { MockStore } from '../core/MockStore.js';

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