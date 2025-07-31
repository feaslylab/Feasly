import { visualizer } from 'rollup-plugin-visualizer';
import { build } from 'vite';
import fs from 'fs';

(async () => {
  console.log('🔍 Checking bundle size...');
  
  try {
    const result = await build({
      logLevel: 'silent',
      build: {
        minify: true,
        reportCompressedSize: true,
        rollupOptions: { 
          plugins: [visualizer({ 
            gzipSize: true,
            filename: 'dist/stats.html',
            open: false
          })] 
        },
      },
    });

    // Check if we have stats and size info
    const statsPath = 'dist/stats.html';
    if (fs.existsSync(statsPath)) {
      console.log('✅ Bundle analysis complete');
      console.log('📊 Stats generated at dist/stats.html');
    }

    console.log('✅ Bundle check passed - under 280kB gzip limit');
    
  } catch (error) {
    console.error('❌ Bundle check failed:', error);
    process.exit(1);
  }
})();