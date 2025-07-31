#!/usr/bin/env node

/**
 * Accessibility Linting Script
 * Wrapper for running the a11y check
 */

import { spawn } from 'child_process';

// Run the accessibility check
const axeProcess = spawn('node', ['scripts/a11y-check.js'], {
  stdio: 'inherit'
});

axeProcess.on('error', (error) => {
  console.error('Failed to start accessibility check:', error);
  process.exit(1);
});

axeProcess.on('close', (code) => {
  process.exit(code);
});