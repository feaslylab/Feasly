#!/usr/bin/env node
import { execSync } from 'node:child_process';

/**
 * CI script to check for untracked TODOs in source code
 * Allows: TODO[tracked]: comments
 * Blocks: TODO: comments without tracking
 */

try {
  // Search for TODO: in src files, excluding test files and node_modules
  const cmd = `git grep -n "TODO:" -- 'src/**' ':!**/*.test.*' ':!**/node_modules/**' || true`;
  const output = execSync(cmd, { encoding: 'utf8' });
  
  if (!output.trim()) {
    console.log('✅ No untracked TODOs found');
    process.exit(0);
  }
  
  const lines = output.split('\n').filter(Boolean);
  
  // Filter out allowed TODO[tracked]: format
  const untracked = lines.filter(line => {
    return !line.includes('TODO[tracked]:');
  });
  
  if (untracked.length === 0) {
    console.log('✅ All TODOs are properly tracked');
    process.exit(0);
  }
  
  console.error('❌ Found untracked TODOs:');
  console.error('  Use "TODO[tracked]: description" format instead');
  console.error('');
  untracked.forEach(line => {
    console.error(`  ${line}`);
  });
  
  process.exit(1);
  
} catch (error) {
  if (error.status === 1 && error.stdout && !error.stdout.includes('TODO:')) {
    // Git grep returned 1 because no matches were found
    console.log('✅ No untracked TODOs found');
    process.exit(0);
  }
  
  console.error('❌ Error checking TODOs:', error.message);
  process.exit(1);
}