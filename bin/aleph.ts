#!/usr/bin/env npx tsx
/**
 * Aleph CLI - Command-line companion for the PRNSA platform
 * 
 * Usage: npx tsx bin/aleph.ts [command] [options]
 */

import { run } from '../src/index.js';

run(process.argv);
