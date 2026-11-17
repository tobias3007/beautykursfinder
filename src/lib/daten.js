import land from '../config/land.json';
import anbieterRoh from '../data/anbieter.json';

export const config = land;
export const MIN = land.mindestanbieter_stadtseite;
export const kursarten = land.kursarten;
export const staedte = land.staedte;
export const kursart = (slug) => kursarten.find((k) => k.slug === slug);
export const stadtBySlug = (slug) => staedte.find((s) => s.slug === slug);
export const eur = (n) => n.toLocaleString('de-DE') + ' €';
export const datum = (iso) => iso.split('-').reverse().join('.');

const slugify = (s) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Anbieter mit Hilfsfeldern
export const anbieter = anbieterRoh.map((a) => ({
  ...a,
  stadtSlug: slugify(a.stadt.wert),
  kurse: a.kurse.map((k) => ({ ...k, def: kursarten.find((x) => x.id === k.kursart) })),
}));

export const feldWert = (f) => (f && f.wert !== null && f.wert !== undefined ? f.wert : null);
export const auf = (f, fmt = (x) => String(x)) => (feldWert(f) !== null ? fmt(f.wert) : 'auf Anfrage');
export const preisText = (f) => {
  const w = feldWert(f);
  if (!w) return 'auf Anfrage';
  const m = w.mwst === 'zzgl' ? ' zzgl. MwSt.' : w.mwst === 'inkl' ? ' inkl. MwSt.' : '';
  return (w.min === w.max ? eur(w.min) : `${eur(w.min)} bis ${eur(w.max)}`) + m;
};

// Gesamtstand: spätestes Prüfdatum aller Felder
export const datenstand = (() => {
  let max = '';
  const walk = (o) => { if (o && typeof o === 'object') { if (o.geprueft && o.geprueft > max) max = o.geprueft; Object.values(o).forEach(walk); } };
  walk(anbieterRoh);
  return max || '2026-11-17';
})();

export const imAngebot = (art) => anbieter.filter((a) => a.kurse.some((k) => k.kursart === art));
export const imAngebotStadt = (art, stadtName) => imAngebot(art).filter((a) => a.stadt.wert === stadtName);
export const kursVon = (a, art) => a.kurse.find((k) => k.kursart === art);
export const preise = (art) => imAngebot(art).map((a) => ({ a, k: kursVon(a, art) })).filter((x) => feldWert(x.k.preis));
export const preisStat = (liste) => {
  const alle = liste.flatMap((x) => [feldWert(x.k.preis).min, feldWert(x.k.preis).max]).sort((a, b) => a - b);
  if (!alle.length) return null;
  const mid = Math.floor(alle.length / 2);
  const mins = liste.map((x) => feldWert(x.k.preis).min).sort((a, b) => a - b);
  const h = Math.floor(mins.length / 2);
  const median = mins.length % 2 ? mins[h] : Math.round((mins[h - 1] + mins[h]) / 2);
  return { min: alle[0], max: alle[alle.length - 1], n: liste.length, median };
};
// Stadtseiten nur ab MIN Anbietern
export const stadtSeiten = kursarten.flatMap((k) => staedte
  .map((s) => ({ kursart: k, stadt: s, liste: imAngebotStadt(k.id, s.name) }))
  .filter((x) => x.liste.length >= MIN));
// Profil nur indexierbar, wenn es mindestens ein geprüftes Kursfeld gibt
export const hatSubstanz = (a) => a.kurse.some((k) => ['preis', 'dauer', 'gruppengroesse', 'zertifikat'].some((f) => feldWert(k[f]) !== null));
export const mailEintrag = (a) => {
  const betreff = encodeURIComponent(`Eintrag ändern oder übernehmen: ${a.name.wert} (${a.stadt.wert})`);
  const text = encodeURIComponent(`Guten Tag,\n\nich möchte den Eintrag zu "${a.name.wert}" in ${a.stadt.wert} (${config.domain}/anbieter/${a.id}/) ändern oder übernehmen.\n\nÄnderung:\n`);
  return `mailto:${config.kontakt.email}?subject=${betreff}&body=${text}`;
};

// Karten sortieren: erst mit Preis (aufsteigend), dann mit anderen Angaben, dann Rest nach Name
export const sortiere = (liste, art) => [...liste].sort((x, y) => {
  const kx = kursVon(x, art), ky = kursVon(y, art);
  const px = feldWert(kx.preis)?.min ?? Infinity, py = feldWert(ky.preis)?.min ?? Infinity;
  if (px !== py) return px - py;
  const wx = ['dauer', 'zertifikat', 'gruppengroesse'].filter((f) => feldWert(kx[f]) !== null).length;
  const wy = ['dauer', 'zertifikat', 'gruppengroesse'].filter((f) => feldWert(ky[f]) !== null).length;
  return wy - wx || x.name.wert.localeCompare(y.name.wert, 'de');
});
export const telHref = (a) => (feldWert(a.telefon) ? 'tel:' + a.telefon.wert.replace(/[^\d+]/g, '') : null);
