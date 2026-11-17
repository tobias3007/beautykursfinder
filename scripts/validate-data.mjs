// Prüft anbieter.json: jedes Feld braucht wert; ein Wert braucht quelle und geprueft.
import { readFileSync } from 'node:fs';
const daten = JSON.parse(readFileSync(new URL('../src/data/anbieter.json', import.meta.url)));
const fehler = [];
for (const a of daten) {
  for (const [feld, f] of Object.entries(a)) {
    if (f && typeof f === 'object' && !Array.isArray(f) && 'wert' in f && f.wert !== null) {
      if (!f.quelle || !/^\d{4}-\d{2}-\d{2}$/.test(f.geprueft || '')) fehler.push(`${a.id}.${feld}: Quelle oder Prüfdatum fehlt`);
    }
  }
}
if (fehler.length) { console.error(fehler.join('\n')); process.exit(1); }
console.log(`Daten ok: ${daten.length} Anbieter`);
