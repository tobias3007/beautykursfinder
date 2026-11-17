// Prüft anbieter.json: jedes Feld braucht wert; ein Wert braucht quelle und geprueft.
import { readFileSync } from 'node:fs';
const daten = JSON.parse(readFileSync(new URL('../src/data/anbieter.json', import.meta.url)));
const fehler = [];
const pruefe = (o, pfad) => {
  if (Array.isArray(o)) return o.forEach((x, i) => pruefe(x, `${pfad}[${i}]`));
  if (!o || typeof o !== 'object') return;
  if ('wert' in o && o.wert !== null && (!o.quelle || !/^\d{4}-\d{2}-\d{2}$/.test(o.geprueft || ''))) fehler.push(`${pfad}: Quelle oder Prüfdatum fehlt`);
  for (const [k, v] of Object.entries(o)) if (k !== 'wert') pruefe(v, `${pfad}.${k}`);
};
for (const a of daten) pruefe(a, a.id);
if (fehler.length) { console.error(fehler.join('\n')); process.exit(1); }
console.log(`Daten ok: ${daten.length} Anbieter`);
