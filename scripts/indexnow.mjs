// Meldet alle URLs der Sitemap an IndexNow. Schlüssel: Repository-Variable INDEXNOW_KEY,
// Schlüsseldatei liegt unter public/<schluessel>.txt.
import { readFileSync, readdirSync } from 'node:fs';
const host = 'beautykursfinder.de';
const key = process.env.INDEXNOW_KEY;
if (!key) { console.log('INDEXNOW_KEY nicht gesetzt, übersprungen'); process.exit(0); }
const urls = [];
for (const f of readdirSync('dist').filter(n => /^sitemap-\d+\.xml$/.test(n)))
  urls.push(...[...readFileSync(`dist/${f}`, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]));
if (!urls.length) { console.log('keine URLs'); process.exit(0); }
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log('IndexNow', r.status, urls.length, 'URLs');
