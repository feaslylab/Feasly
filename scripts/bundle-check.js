#!/usr/bin/env node

/**
 * Bundle Size Check Script
 * Analyzes bundle size and enforces performance budget
 * Budget: Main JS ≤ 250 kB gzipped
 */

import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// Performance budget (in bytes)
const BUDGET = {
  JS_MAIN: 250 * 1024,    // 250 kB gzipped
  CSS_MAIN: 50 * 1024,    // 50 kB gzipped  
  TOTAL_ASSETS: 1024 * 1024 // 1 MB total
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'kB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);
    const gzipped = gzipSync(content);
    
    return {
      raw: stats.size,
      gzipped: gzipped.length
    };
  } catch (error) {
    console.warn(`Could not read file: ${filePath}`);
    return { raw: 0, gzipped: 0 };
  }
}

function analyzeBundle() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Dist directory not found. Run `pnpm build` first.');
    process.exit(1);
  }

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ Assets directory not found in dist.');
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR);
  
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  // Find main JS bundle (usually the largest)
  const mainJsFile = jsFiles
    .map(f => ({
      name: f,
      path: path.join(ASSETS_DIR, f),
      ...getFileSize(path.join(ASSETS_DIR, f))
    }))
    .sort((a, b) => b.gzipped - a.gzipped)[0];

  // Find main CSS bundle
  const mainCssFile = cssFiles
    .map(f => ({
      name: f,
      path: path.join(ASSETS_DIR, f),
      ...getFileSize(path.join(ASSETS_DIR, f))
    }))
    .sort((a, b) => b.gzipped - a.gzipped)[0];

  // Calculate totals
  const totalJs = jsFiles.reduce((acc, f) => 
    acc + getFileSize(path.join(ASSETS_DIR, f)).gzipped, 0
  );
  
  const totalCss = cssFiles.reduce((acc, f) => 
    acc + getFileSize(path.join(ASSETS_DIR, f)).gzipped, 0
  );

  const totalAssets = totalJs + totalCss;

  console.log('📦 Bundle Analysis\n');
  
  if (mainJsFile) {
    console.log(`📄 Main JS: ${mainJsFile.name}`);
    console.log(`   Raw: ${formatBytes(mainJsFile.raw)}`);
    console.log(`   Gzipped: ${formatBytes(mainJsFile.gzipped)}`);
    console.log(`   Budget: ${formatBytes(BUDGET.JS_MAIN)} (${mainJsFile.gzipped <= BUDGET.JS_MAIN ? '✅' : '❌'})`);
    console.log('');
  }

  if (mainCssFile) {
    console.log(`🎨 Main CSS: ${mainCssFile.name}`);
    console.log(`   Raw: ${formatBytes(mainCssFile.raw)}`);
    console.log(`   Gzipped: ${formatBytes(mainCssFile.gzipped)}`);
    console.log(`   Budget: ${formatBytes(BUDGET.CSS_MAIN)} (${mainCssFile.gzipped <= BUDGET.CSS_MAIN ? '✅' : '❌'})`);
    console.log('');
  }

  console.log(`📊 Totals:`);
  console.log(`   Total JS: ${formatBytes(totalJs)}`);
  console.log(`   Total CSS: ${formatBytes(totalCss)}`);
  console.log(`   Total Assets: ${formatBytes(totalAssets)}`);
  console.log(`   Budget: ${formatBytes(BUDGET.TOTAL_ASSETS)} (${totalAssets <= BUDGET.TOTAL_ASSETS ? '✅' : '❌'})`);
  console.log('');

  // Check budget violations
  const violations = [];
  
  if (mainJsFile && mainJsFile.gzipped > BUDGET.JS_MAIN) {
    const overage = mainJsFile.gzipped - BUDGET.JS_MAIN;
    violations.push(`Main JS is ${formatBytes(overage)} over budget`);
  }

  if (mainCssFile && mainCssFile.gzipped > BUDGET.CSS_MAIN) {
    const overage = mainCssFile.gzipped - BUDGET.CSS_MAIN;
    violations.push(`Main CSS is ${formatBytes(overage)} over budget`);
  }

  if (totalAssets > BUDGET.TOTAL_ASSETS) {
    const overage = totalAssets - BUDGET.TOTAL_ASSETS;
    violations.push(`Total assets are ${formatBytes(overage)} over budget`);
  }

  if (violations.length > 0) {
    console.error('❌ Performance Budget VIOLATED:');
    violations.forEach(v => console.error(`   - ${v}`));
    console.error('');
    console.error('💡 Suggestions:');
    console.error('   - Use dynamic imports for large dependencies');
    console.error('   - Lazy load chart libraries with React.lazy()');
    console.error('   - Check for duplicate dependencies in the bundle');
    console.error('   - Consider code splitting by route');
    console.error('');
    process.exit(1);
  } else {
    console.log('✅ Performance Budget PASSED');
    console.log('All bundles are within acceptable limits.');
  }
}

analyzeBundle();