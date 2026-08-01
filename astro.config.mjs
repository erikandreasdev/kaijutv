// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical origin — drives canonical URLs, Open Graph tags and the sitemap.
const site = process.env.PUBLIC_SITE_URL || 'https://kaiju-tv.com';

export default defineConfig({
  site,
  integrations: [
    react(),
    sanity({
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
      useCdn: false,
      studioBasePath: '/studio',
    }),
    sitemap({
      // The embedded Studio must never be indexed.
      filter: (page) => !page.includes('/studio'),
    }),
  ],
  redirects: {
    // The ebook landing was retired; keep old inbound links alive.
    '/video-marketing': '/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
