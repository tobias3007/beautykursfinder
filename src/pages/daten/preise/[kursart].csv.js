import { kursarten, preise, feldWert } from '../../../lib/daten.js';
export function getStaticPaths() { return kursarten.map((k) => ({ params: { kursart: k.slug }, props: { k } })); }
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
export function GET({ props }) {
  const { k } = props;
  const zeilen = [['anbieter', 'stadt', 'kursart', 'preis_min_eur', 'preis_max_eur', 'mwst_laut_anbieter', 'quelle', 'geprueft'].join(',')];
  for (const { a, k: c } of preise(k.id)) { const p = feldWert(c.preis); zeilen.push([q(a.name.wert), q(a.stadt.wert), k.id, p.min, p.max, p.mwst || '', q(c.preis.quelle), c.preis.geprueft].join(',')); }
  return new Response(zeilen.join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
