#!/usr/bin/env node

/**
 * Development server startup script for CI/testing
 */

import { spawn } from 'child_process';
import { exit } from 'process';

const PORT = process.env.PORT || 5173;

console.log(`🚀 Starting development server on port ${PORT}...`);

const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT.toString() }
});

viteProcess.on('error', (error) => {
  console.error('Failed to start dev server:', error);
  exit(1);
});

// Let the server start up
setTimeout(() => {
  console.log('✅ Development server should be ready');
}, 3000);

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dev server...');
  viteProcess.kill();
  exit(0);
});
