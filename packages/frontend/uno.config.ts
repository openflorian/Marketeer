import { defineConfig, presetWind, presetWebFonts, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetWind(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: ['Inter:400,500,600,700'],
        mono: ['JetBrains Mono:400,500'],
      },
    }),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
      },
    }),
  ],
  theme: {
    colors: {
      elite: {
        dark: '#0b0f19',
        darker: '#06070f',
        accent: '#6366f1', // Indigo
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  },
  safelist: [
    // Dynamische Klassen für Grid-Spanning
    'col-span-1', 'col-span-2', 'row-span-1', 'row-span-2',
    'md:col-span-1', 'md:col-span-2', 'md:row-span-1', 'md:row-span-2',
  ],
});
