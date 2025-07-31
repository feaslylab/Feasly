#!/usr/bin/env node

/**
 * Master script to run all Phase 3 P0 checks
 */

import { spawn } from 'child_process';
import { exit } from 'process';

const checks = [
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['test', '--run']
  },
  {
    name: 'Bundle Size Check',
    command: 'node',
    args: ['scripts/bundle-check.js']
  },
  {
    name: 'Accessibility Check',
    command: 'node', 
    args: ['scripts/a11y-check.js']
  }
];

async function runCheck(check) {
  console.log(`\n🔍 Running ${check.name}...`);
  
  return new Promise((resolve, reject) => {
    const process = spawn(check.command, check.args, {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${check.name} passed`);
        resolve();
      } else {
        console.error(`❌ ${check.name} failed`);
        reject(new Error(`${check.name} failed with exit code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      console.error(`Failed to run ${check.name}:`, error);
      reject(error);
    });
  });
}

async function runAllChecks() {
  console.log('🚀 Starting Phase 3 P0 quality checks...\n');
  
  try {
    for (const check of checks) {
      await runCheck(check);
    }
    
    console.log('\n✅ All checks passed! Ready for beta-0.9.0');
    exit(0);
    
  } catch (error) {
    console.error('\n❌ Some checks failed. Please fix issues before merging.');
    exit(1);
  }
}

runAllChecks();