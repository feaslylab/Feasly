import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ...(mode === "development" ? [componentTagger()] : []),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB limit instead of default 2 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Feasly - Real Estate Financial Modeling',
        short_name: 'Feasly',
        description: 'Advanced real estate development financial modeling and analytics platform',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "feasly-engine": path.resolve(__dirname, "./packages/feasly-engine/src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Chart libraries in separate chunk
          'charts': ['recharts', 'd3-dsv'],
          // Date utilities
          'date-utils': ['date-fns'],
          // Large utility libraries  
          'utils': ['lodash', 'clsx', 'tailwind-merge'],
          // UI framework
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion'
          ],
          // React Query and data fetching
          'data': ['@tanstack/react-query', '@supabase/supabase-js'],
        }
      }
    },
    // Performance optimizations
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      'lucide-react'
    ],
    exclude: [
      // Exclude heavy dev-only dependencies
      '@testing-library/react',
      '@testing-library/user-event',
      'vitest'
    ]
  },
}));
