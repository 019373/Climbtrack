import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Pages
// ─────────────────────────────────────────────────────────────────────────────
//
// L'application est publiée ici :
//
// https://<user>.github.io/Climbtrack/
//
// La casse doit correspondre exactement au nom du repository.
//
const BASE = '/Climbtrack/';

export default defineConfig({
  base: BASE,

  plugins: [
    react(),

    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'icons/icon-512.png',
      ],

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg}',
        ],

        navigateFallback:
          `${BASE}index.html`,
      },

      manifest: {
        name: 'ClimbTrack',
        short_name: 'ClimbTrack',

        description:
          'Application de suivi d’entraînement pour l’escalade et la préparation physique.',

        theme_color: '#000000',
        background_color: '#000000',

        display: 'standalone',
        orientation: 'portrait',

        /*
         * Très important sur GitHub Pages :
         *
         * La PWA doit toujours démarrer et rester
         * à l'intérieur de /Climbtrack/.
         */
        start_url: BASE,
        scope: BASE,

        icons: [
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },

          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(
        import.meta.dirname,
        'src',
      ),
    },

    dedupe: [
      'react',
      'react-dom',
    ],
  },

  root: path.resolve(
    import.meta.dirname,
  ),

  build: {
    outDir: path.resolve(
      import.meta.dirname,
      'dist',
    ),

    emptyOutDir: true,
  },
});