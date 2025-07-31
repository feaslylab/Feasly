#!/usr/bin/env node

/**
 * Accessibility Check Script
 * Runs axe-core against all key pages in both light and dark modes
 * Fails if any serious/critical violations are found
 */

import { spawn } from 'child_process';
import { exit } from 'process';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5173';

// Core pages to test
const PAGES = [
  '/',
  '/dashboard', 
  '/feasly-model',
  '/feasly-insights',
  '/feasly-finance',
  '/feasly-flow',
  '/projects',
  '/auth'
];

// WCAG AA rules focused on serious/critical issues
const AXE_RULES = [
  'wcag21aa', 
  'wcag2a',
  'best-practice'
];

let totalViolations = 0;
let criticalViolations = 0;

async function runAxeCheck(url, mode = 'light') {
  console.log(`🔍 Testing ${url} (${mode} mode)...`);
  
  const args = [
    BASE_URL + url,
    '--rules', AXE_RULES.join(','),
    '--tags', 'wcag21aa,wcag2a',
    '--format', 'json',
    '--chromium-no-sandbox'
  ];

  // Add dark mode simulation
  if (mode === 'dark') {
    args.push('--chrome-options', '--force-dark-mode');
  }

  return new Promise((resolve, reject) => {
    const axeProcess = spawn('npx', ['@axe-core/cli', ...args], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    axeProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    axeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    axeProcess.on('close', (code) => {
      try {
        if (output.trim()) {
          const result = JSON.parse(output);
          const violations = result.violations || [];
          
          const serious = violations.filter(v => 
            v.impact === 'serious' || v.impact === 'critical'
          );

          totalViolations += violations.length;
          criticalViolations += serious.length;

          if (serious.length > 0) {
            console.error(`❌ ${url} (${mode}): ${serious.length} serious/critical violations`);
            serious.forEach(violation => {
              console.error(`  - ${violation.id}: ${violation.description}`);
              console.error(`    Impact: ${violation.impact}, Tags: ${violation.tags.join(', ')}`);
            });
          } else {
            console.log(`✅ ${url} (${mode}): No serious violations`);
          }
        }
        resolve();
      } catch (parseError) {
        console.error(`Failed to parse axe output for ${url}:`, parseError);
        console.error('Raw output:', output);
        console.error('Error output:', errorOutput);
        reject(parseError);
      }
    });

    axeProcess.on('error', (error) => {
      console.error(`Failed to run axe for ${url}:`, error);
      reject(error);
    });
  });
}

async function main() {
  console.log('🚀 Starting accessibility check...');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('');

  try {
    // Test all pages in both light and dark modes
    for (const page of PAGES) {
      await runAxeCheck(page, 'light');
      await runAxeCheck(page, 'dark');
    }

    console.log('');
    console.log('📊 Summary:');
    console.log(`Total violations: ${totalViolations}`);
    console.log(`Critical/Serious violations: ${criticalViolations}`);

    if (criticalViolations > 0) {
      console.error('');
      console.error('❌ Accessibility check FAILED');
      console.error(`Found ${criticalViolations} critical/serious violations`);
      console.error('Please fix these issues before merging to main.');
      exit(1);
    } else {
      console.log('');
      console.log('✅ Accessibility check PASSED');
      console.log('No critical or serious violations found.');
      exit(0);
    }

  } catch (error) {
    console.error('');
    console.error('💥 Accessibility check encountered an error:', error);
    exit(1);
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Accessibility check interrupted');
  exit(1);
});

main();