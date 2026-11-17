import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Land-Konfiguration: LAND_CONFIG=land-at.json wählt eine andere Datei in src/config/.
const datei = process.env.LAND_CONFIG || 'land.json';
const land = JSON.parse(readFileSync(new URL(`./src/config/${datei}`, import.meta.url)));

// Anbieterprofile ohne geprüftes Kursfeld sind noindex und gehören nicht in die Sitemap.
const roh = JSON.parse(readFileSync(new URL('./src/data/anbieter.json', import.meta.url)));
const ohneSubstanz = roh.filter((a) => !a.kurse.some((k) => ['preis', 'dauer', 'gruppengroesse', 'zertifikat'].some((f) => k[f] && k[f].wert !== null && k[f].wert !== undefined))).map((a) => a.id);

// Statisch, Domain im Wurzelpfad: läuft unverändert auf GitHub Pages und Cloudflare Pages.
export default defineConfig({
  site: `https://${land.domain}`,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  integrations: [sitemap({ filter: (p) => !/\/(impressum|datenschutz)\//.test(p) && !ohneSubstanz.some((id) => p.includes(`/anbieter/${id}/`)) })],
});
