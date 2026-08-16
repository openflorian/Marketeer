import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import UnoCSS from 'unocss/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [
    preact({
      compat: true,
    }),
    UnoCSS(),
  ],
  output: 'hybrid', // SSG + SSR kombiniert
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },
  // Core Web Vitals Optimierungen
  compressHTML: true,
  // Preload-Strategien für LCP
  prefetch: {
    prefetchAll: true,
  },
});
