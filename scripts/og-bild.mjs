// Erzeugt public/og.png (1200x630) aus einem SVG. Einmalig ausführen, Ergebnis wird eingecheckt.
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#7b2d5b"/><rect x="60" y="60" width="1080" height="510" rx="28" fill="#f7eef3"/>
<rect x="110" y="110" width="110" height="110" rx="24" fill="#7b2d5b"/><text x="165" y="195" font-family="Helvetica,Arial,sans-serif" font-size="84" font-weight="700" fill="#fff" text-anchor="middle">B</text>
<text x="110" y="330" font-family="Helvetica,Arial,sans-serif" font-size="68" font-weight="700" fill="#1f2430">Beauty-Schulungen</text>
<text x="110" y="410" font-family="Helvetica,Arial,sans-serif" font-size="68" font-weight="700" fill="#1f2430">in deutschen Großstädten</text>
<text x="110" y="490" font-family="Helvetica,Arial,sans-serif" font-size="36" fill="#566070">Wimpern · Lifting · Permanent Make-up · Microblading</text>
<text x="110" y="540" font-family="Helvetica,Arial,sans-serif" font-size="32" font-weight="700" fill="#7b2d5b">beautykursfinder.de</text></svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('og.png geschrieben');
