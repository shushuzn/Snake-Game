#!/usr/bin/env node
/**
 * Add a seed idea to ideas.md pool
 * Usage: node shared/add-seed.mjs "<seed text>"
 */

import { readFileSync, appendFileSync, existsSync } from 'fs';

const seed = process.argv[2];
if (!seed) {
  console.error('Usage: node shared/add-seed.mjs "<seed text>"');
  process.exit(1);
}

const ideasPath = 'ideas.md';

let content = '';
try {
  if (existsSync(ideasPath)) {
    content = readFileSync(ideasPath, 'utf-8');
  }
} catch (e) {
  // Will create new file
}

const timestamp = new Date().toISOString().split('T')[0];
const entry = `## ${timestamp}\n- [ ] ${seed} | pending\n`;

if (!content.includes(entry)) {
  appendFileSync(ideasPath, entry);
  console.log(`✅ Seed added: "${seed}"`);
} else {
  console.log(`⚠️ Seed already exists`);
}
