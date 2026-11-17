// Abnahmebericht (SEO-GEO-STANDARD Abschnitt 8, Punkte 3 bis 7) aus dem Build in dist/.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const html = walk('dist').filter((p) => p.endsWith('.html'));
const urlVon = (p) => '/' + p.replace(/^dist\//, '').replace(/index\.html$/, '').replace(/404\.html$/, '404');
const seiten = html.map((p) => {
  const t = readFileSync(p, 'utf8');
  const dec = (x) => x.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const g = (re) => dec((t.match(re) || [])[1] || '');
  return { url: urlVon(p), titel: g(/<title>(.*?)<\/title>/), desc: g(/<meta name="description" content="(.*?)"/), h1: [...t.matchAll(/<h1[ >]/g)].length, h1text: g(/<h1[^>]*>(.*?)<\/h1>/), canonical: g(/<link rel="canonical" href="(.*?)"/), noindex: /name="robots" content="noindex/.test(t), links: [...t.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]), jsonld: [...t.matchAll(/application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1])['@type']) };
});
const sm = walk('dist').filter((p) => /sitemap-\d+\.xml$/.test(p)).map((p) => readFileSync(p, 'utf8')).join('');
const inSitemap = new Set([...sm.matchAll(/<loc>https:\/\/[^/]+(.*?)<\/loc>/g)].map((m) => m[1]));
const robots = readFileSync('dist/robots.txt', 'utf8');
const dup = (k) => { const c = {}; seiten.filter((s) => !s.noindex).forEach((s) => (c[s[k]] ||= []).push(s.url)); return Object.entries(c).filter(([, v]) => v.length > 1); };
const bekannt = new Set(seiten.map((s) => s.url));
const defekt = [], eingehend = new Set();
for (const s of seiten) for (const l of s.links) { if (!l.startsWith('/')) continue; const ziel = l.split('#')[0]; if (!/\.[a-z]+$/.test(ziel)) { if (!bekannt.has(ziel)) defekt.push(`${s.url} -> ${l}`); eingehend.add(ziel); } }
const verwaist = seiten.filter((s) => s.url !== '/' && s.url !== '/404' && !eingehend.has(s.url)).map((s) => s.url);
const arten = {};
for (const s of seiten) { const a = s.url === '/' ? 'Startseite' : s.url === '/404' ? '404' : s.url.startsWith('/anbieter/') ? 'Anbieterprofil' : s.url.startsWith('/preise/') ? 'Preisübersicht' : /^\/(impressum|datenschutz|methodik)\//.test(s.url) ? s.url : s.url.split('/').length === 3 ? 'Kursart' : 'Stadt je Kursart'; (arten[a] ||= []).push(s); }
const daten = JSON.parse(readFileSync('src/data/anbieter.json', 'utf8'));
const kurse = daten.flatMap((a) => a.kurse);
const anteil = (f) => kurse.filter((k) => k[f].wert !== null).length;
const aus = [];
aus.push('# Abnahmebericht (automatisch aus dem Build)\n');
aus.push(`Seiten gesamt: ${seiten.length}, indexierbar: ${seiten.filter((s) => !s.noindex && s.url !== '/404').length}, in der Sitemap: ${inSitemap.size}\n`);
aus.push('## Seitenarten');
for (const [a, l] of Object.entries(arten)) aus.push(`- ${a}: ${l.length} (JSON-LD: ${[...new Set(l.flatMap((s) => s.jsonld))].join(', ') || 'keine'}; noindex: ${l.filter((s) => s.noindex).length})`);
aus.push('\n## Prüfungen');
aus.push(`- Doppelte Titel: ${dup('titel').length}${dup('titel').slice(0, 5).map(([t, u]) => `\n  - "${t}": ${u.join(', ')}`).join('')}`);
aus.push(`- Doppelte Beschreibungen: ${dup('desc').length}`);
aus.push(`- Titel über 60 Zeichen: ${seiten.filter((s) => s.titel.length > 60).length}`);
aus.push(`- Seiten ohne genau eine H1: ${seiten.filter((s) => s.h1 !== 1).map((s) => s.url).join(', ') || '0'}`);
aus.push(`- Canonical nicht auf sich selbst: ${seiten.filter((s) => s.url !== '/404' && !s.canonical.endsWith(s.url)).length}`);
aus.push(`- Defekte interne Links: ${defekt.length}${defekt.slice(0, 5).map((d) => `\n  - ${d}`).join('')}`);
aus.push(`- Verwaiste Seiten: ${verwaist.length}${verwaist.slice(0, 5).map((d) => `\n  - ${d}`).join('')}`);
aus.push('\n## Anbieterdaten');
aus.push(`- Anbieter: ${daten.length}, Kurse: ${kurse.length}`);
for (const f of ['preis', 'dauer', 'gruppengroesse', 'zertifikat', 'termine']) aus.push(`- ${f}: ${anteil(f)} von ${kurse.length} Kursen (${Math.round(anteil(f) / kurse.length * 100)} %)`);
aus.push(`- Telefon: ${daten.filter((a) => a.telefon.wert).length} von ${daten.length} Anbietern`);
const ohneQ = JSON.stringify(daten).match(/"wert":(?!null)[^}]*?\}/g) || [];
aus.push(`- Felder mit Wert ohne Quelle/Prüfdatum: wird beim Build durch validate-data geprüft (Fehler = Abbruch)`);
const nz = ['/impressum/', '/datenschutz/'];
aus.push('\n## Impressum und Datenschutz');
for (const u of nz) { const s = seiten.find((x) => x.url === u); aus.push(`- ${u}: noindex ${s?.noindex ? 'ja' : 'NEIN'}, in Sitemap ${inSitemap.has(u) ? 'JA' : 'nein'}, in robots.txt gesperrt ${new RegExp('Disallow:\\s*' + u).test(robots) ? 'JA' : 'nein'}`); }
aus.push('\n## Seitenliste (Titel, H1, Canonical, Index)');
aus.push('| URL | Titel | H1 | Canonical | Index |\n|---|---|---|---|---|');
for (const s of seiten.sort((a, b) => a.url.localeCompare(b.url))) aus.push(`| ${s.url} | ${s.titel} | ${s.h1text.replace(/<[^>]+>/g, '')} | ${s.canonical.replace(/^https:\/\/[^/]+/, '')} | ${s.noindex ? 'noindex' : s.url === '/404' ? '404' : 'index'} |`);
console.log(aus.join('\n'));
