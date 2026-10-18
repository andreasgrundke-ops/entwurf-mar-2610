# Entwurf „Muster“ – Website, Flyer, Visitenkarte (v2.1.0, 19.10.2026)

Statisches Mockup-Paket für Marion, systemische Beratung (in Weiterbildung).
Entwurf / Mockup · Gestaltung: Grundke IT-Service · Entwurf mit KI-Unterstützung erstellt.
Die Vorschau ist bewusst nicht für Suchmaschinen gedacht: jede Seite trägt `noindex,nofollow`.

## Stack
- Reines HTML, CSS und etwas JavaScript. Kein Framework, kein Build-Schritt.
- Schriften selbst gehostet, Original-Dateien der Projekte, nicht verändert (SIL Open Font License 1.1, Lizenz je Ordner in `assets/fonts/*/OFL.txt`):
  - Young Serif (Überschriften, Titelschilder)
  - Atkinson Hyperlegible Next (Text, Bedienung)
  - Manrope (nur Präsentations-Übersicht `hub/` und Handy-Rahmen `mobile/`, Original-WOFF2 aus googlefonts/manrope)
- Keine externen Requests: keine CDNs, keine Webfonts von fremden Servern, kein Tracking, keine Cookies.
- Muster sind selbst gezeichnete SVG-Kacheln in `css/muster.css` (als CSS-Hintergrund), dekorativ und für Screenreader ausgeblendet.

## Struktur
```
index.html                 Startseite
anliegen/*.html            sechs Anliegen-Seiten
impressum.html             Vorschau-Impressum (Platzhalter)
datenschutz.html           Vorschau-Datenschutz (Platzhalter)
hub/index.html             Präsentations-Übersicht (Grundke-CI)
mobile/index.html          Handy-Rahmen (390 px) für die Vorschau am PC
flyer/index.html           Flyer A4 quer, Wickelfalz, druckbar
visitenkarte/index.html    Visitenkarte 85 × 55 mm, Druck mit 3 mm Beschnitt
instagram/index.html       optionale Profil-Skizze und drei Vorlagen
css/site.css               Gestaltung der Website
css/muster.css             die sechs Muster
js/site.js                 Menü, Signatur-Bewegung, mobile Aktionsleiste
assets/fonts/              Schriften mit Lizenzen
assets/img/                Logo Grundke IT-Service (nur im Hub), og.png 1200 × 630 (Vorschaubild)
```

## Entscheidungen
- **Idee „Muster“:** Familien geraten in Muster, Beratung unterbricht eines an einer Stelle. Jedes Anliegen hat ein eigenes gewebtes Muster und eine Farbe (Kornblau, Senf, Himbeer, Petrol, Flieder, Graphit). Auf der Website läuft im Hero genau eine Reihe mit hellerem Faden vom Titelschild aus durchs Muster (die Unterbrechung). In Regal und Bändern rückt eine Reihe nur beim Darüberfahren oder Fokussieren zur Seite. Im Druck (Flyer, Karte, Instagram) gibt es keinen Versatz.
- **Anliegen zuerst:** Die Startseite beginnt mit der Lage („Wenn es in der Familie nur noch knirscht.“), jede Anliegen-Seite mit einem Satz, wie ihn Ratsuchende selbst sagen würden.
- **Keine Fotos von Menschen.** Platz für ein kleines Foto von Marion ist als Exlibris vorgesehen.
- **Bewegung:** nur eine Signatur-Bewegung. Bei „Bewegung reduzieren“ im Betriebssystem steht der Endzustand sofort da.
- **Barrierefreiheit:** Textkontraste mindestens 4,5:1, Bedienflächen mindestens 44 px, sichtbarer Fokus, echte Links und Knöpfe.
- **Kontaktformular:** nur Attrappe. Felder deaktiviert, kein Versand, sichtbarer Hinweis.
- **Recht:** „Beratung“, nie Behandlung; Abgrenzung zur Psychotherapie offen ausgesprochen; Krisennummern auf Startseite, jeder Anliegen-Seite und im Flyer.

## Platzhalter (alle in eckigen Klammern sichtbar)
[NACHNAME] · [TELEFON] · [E-MAIL] · [WEBADRESSE] · [@INSTAGRAM] · [ORT] · [STRASSE] · [PLZ] · [PREIS PRO SITZUNG] · [DAUER] · [ERSTGESPRÄCH KOSTENLOS? – VORSCHLAG] · [ABSCHLUSS MONAT/JAHR] · [INSTITUT] · [ZEITRAUM] · [2–3 SÄTZE VON DIR] · [DEIN WEG IN 2–3 SÄTZEN] (Flyer) · [FOTO MARION] · [MUSTER: …] in Impressum und Datenschutz

## Zum Livegang fehlt
- [ ] Alle Platzhalter durch echte Angaben ersetzen (siehe Liste oben), auch im JSON-LD aller Seiten und in `og:url`/`og:image` (derzeit Vorschau-Adresse).
- [ ] Praxisadresse fürs Impressum (keine Privatadresse).
- [ ] Widerrufsbelehrung und Preisangabe (Preis inkl. USt bzw. Hinweis Kleinunternehmerregelung) klären.
- [ ] Formular-Backend mit Sitz in der EU und Auftragsverarbeitungsvertrag (AVV).
- [ ] Videotool für Online-Sitzungen mit AVV, in der Datenschutzerklärung nennen.
- [ ] Google-Unternehmensprofil anlegen (Name, Ort, Kategorie wie auf der Website).
- [ ] `sitemap.xml` anlegen und in `robots.txt` verlinken.
- [ ] Impressum und Datenschutzerklärung von Marion (rechtlich prüfen lassen).
- [ ] Bezeichnung „in Weiterbildung zur Systemischen Beraterin“ nach Abschluss anpassen.
- [ ] Echtes Kontaktformular mit Versand, Spamschutz und Datenschutzhinweis, oder Formular entfernen.
- [ ] Foto von Marion (klein, Hochformat) für „Über mich“ und Instagram.
- [ ] Eigene Domain, `noindex,nofollow` auf allen Seiten entfernen, `robots.txt` für den Livebetrieb prüfen.
- [ ] Title und Meta-Description je Seite mit echtem Ort ergänzen.
- [ ] Erreichbarkeit der Krisennummern vor Livegang erneut prüfen.
- [ ] Druckfarben (besonders Senf und Flieder) beim Druckdienstleister proofen.

© Grundke IT-Service · Entwurf für Marion, Weitergabe nur nach Absprache.
