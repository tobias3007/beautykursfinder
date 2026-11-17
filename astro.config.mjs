import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Land-Konfiguration: LAND_CONFIG=land-at.json wählt eine andere Datei in src/config/.
const datei = process.env.LAND_CONFIG || 'land.json';
const land = JSON.parse(readFileSync(new URL(`./src/config/${datei}`, import.meta.url)));

// Statisch, Domain im Wurzelpfad: läuft unverändert auf GitHub Pages und Cloudflare Pages.
export default defineConfig({
  site: `https://${land.domain}`,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  integrations: [sitemap({ filter: (p) => !/\/(impressum|datenschutz)\//.test(p) })],
});
