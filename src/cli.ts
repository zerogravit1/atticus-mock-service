#!/usr/bin/env node

import fs from 'fs';
import { config } from './atticus.config.js';

const command = process.argv[2];

if (!command || !['record', 'replay'].includes(command)) {
  console.log('Usage: atticus <record|replay>');
  process.exit(1);
}

const mode = command === 'record' ? 'record' : 'replay';

fs.writeFileSync('.atticus-mode', mode);
console.log(`Atticus mode: ${mode}`);