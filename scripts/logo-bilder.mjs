// Rastert Logo-Dateien: apple-touch-icon (180), logo-512 und og.png (1200x630). Einmalig ausführen, Ergebnis einchecken.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
const mark = readFileSync('public/logo-mark.svg');
await sharp(mark, { density: 600 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(mark, { density: 600 }).resize(512, 512).png().toFile('public/logo-512.png');
const inner = readFileSync('public/logo-mark.svg', 'utf8').replace(/<svg[^>]*>/, '').replace('</svg>', '');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#7b2d5b"/><rect x="60" y="60" width="1080" height="510" rx="28" fill="#f7eef3"/>
<g transform="translate(110 100) scale(1.9)">${inner}</g>
<text x="260" y="205" font-family="Helvetica,Arial,sans-serif" font-size="56" letter-spacing="-1"><tspan font-weight="700" fill="#7b2d5b">Beauty</tspan><tspan font-weight="400" fill="#1f2430">kursfinder</tspan></text>
<text x="110" y="340" font-family="Helvetica,Arial,sans-serif" font-size="68" font-weight="700" fill="#1f2430">Beauty-Schulungen</text>
<text x="110" y="420" font-family="Helvetica,Arial,sans-serif" font-size="68" font-weight="700" fill="#1f2430">in deutschen Großstädten</text>
<text x="110" y="500" font-family="Helvetica,Arial,sans-serif" font-size="36" fill="#566070">Wimpern · Lifting · Permanent Make-up · Microblading</text></svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('Logo-Bilder geschrieben');
