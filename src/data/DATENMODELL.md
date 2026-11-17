# Datenmodell

`src/config/land.json` bestimmt Land, Domain, Währung, Kursarten und Städteliste.
Für Österreich oder die Schweiz entsteht eine zweite Konfiguration (eigene Domain,
eigene Städte) bei gleicher Codebasis. Die Konfiguration wird beim Build über die
Umgebungsvariable `LAND_CONFIG` gewählt (Standard: `land.json`).

`src/data/anbieter.json`: Liste von Anbietern. Jedes Datenfeld ist ein Objekt
`{ "wert": ..., "quelle": "<URL der Anbieterseite>", "geprueft": "JJJJ-MM-TT" }`.
Fehlt eine Angabe: `{ "wert": null }`, die Seite zeigt "auf Anfrage". Nichts wird
geschätzt. Keine Texte oder Bewertungen aus Google Maps.

Felder: id, name, stadt, land, kursarten[], preis (je Kursart), dauer, termine,
gruppengroesse, zertifikat, webseite, telefon.
