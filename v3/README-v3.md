# Entwurf v3 „Am Küchentisch“

Stand 19.10.2026 · v3.0.2 · Statisches HTML/CSS, wenig JavaScript, keine externen Ressourcen.
Entwurf v2 im Repo-Root bleibt unverändert; v3 lebt komplett in diesem Ordner.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` | Startseite. Das Hero-SVG ist inline eingesetzt (nötig für den Lade-Moment). |
| `anliegen/familienstreit.html` | Vorlage für alle Anliegen-Seiten |
| `impressum.html`, `datenschutz.html` | Platzhalter im v3-Look |
| `css/site.css` | Gestaltungssystem: Tokens, Tücher, Bausteine, Seiten |
| `js/site.js` | Menü mobil, Aufräumen nach dem Lade-Moment, Sticky-Knopf, Musterformular |
| `assets/fonts/` | Caprasimo und Figtree, woff2, latin + latin-ext, je mit `OFL.txt` |
| `assets/svg/` | Teller je Anliegen, Tassen, Hero-Tisch, Gewebe, Karo-Borte, Mobile |
| `assets/og.png` | Vorschaubild 1200×630: Bildschirmfoto der eigenen Startseite (kein KI-Bild, keine Menschen) |
| `_quellen/` | Erzeugung der SVGs (`svg-generator.mjs`) und der Startseite (`index.vorlage.html` + `baue-index.mjs`) |

## Tokens (Auszug aus `:root`)

| Token | Wert | Rolle |
|---|---|---|
| `--himbeer` | `#B8254E` | Hero-Tischtuch, Kontakt, Hauptfarbe |
| `--tanne` | `#1F5C4A` | Tisch mit den Anliegen |
| `--senf` | `#F3B33D` | Fahrplan/Kosten, Akzent auf dunklen Tüchern |
| `--kobalt` | `#2B6CB0` | Arbeitsweise |
| `--rose` | `#E9C6C9` | Über mich |
| `--pflaume` | `#6B2D57` | Sechstes Tuch: Trennung & Patchwork (ruhiger, ernster Ton) |
| `--leinen` | `#F4D5DB` | heller Grund, rosa Leinen (bewusst kein Creme) |
| `--porzellan` | `#FFFCFB` | nur Gegenstände: Karten, Teller, Formular |
| `--aubergine` | `#2A1E22` | Text, Fuß |

Jeder Abschnitt ist ein **Tuch**: `class="tuch tuch-<farbe>"`. Die Klasse setzt Fläche, Gewebe,
Textfarben (`--tuch-tinte`, `--tuch-tinte-2`, aus dem Ton abgeleitet, AA geprüft), Akzent, Fokusfarbe
und Schattenfarbe. Verfügbar: `himbeer`, `tanne`, `senf`, `kobalt`, `rose`, `leinen`, `pflaume`, `aubergine`.
Zusätze: `genaeht` (gestichelte Naht oben), `<div class="borte">` (Karoband zwischen zwei Tüchern).

Bausteine: `.tischkarte` (Hauptknopf, gefaltetes Kärtchen; `--klein` für Kopf und Sticky),
`.etikett` (Kärtchen ohne Aktion), `.knopf` (Formulare), `.platzhalter` / `.platzhalter-block`,
`.speisekarte`, `.deckel` (Alltagsszenen als Bierdeckel), `.gedeck` (Teller + Tischkarte, Signatur),
`.weitere` (kleine Teller als Links), `.krise__karte`.

## Schriften

- **Caprasimo** (Display), SIL Open Font License 1.1, © The Caprasimo Project Authors
- **Figtree** (Text, variabel 400–800, kursiv 400–600), SIL Open Font License 1.1, © The Figtree Project Authors

Beide von Google Fonts heruntergeladen und selbst gehostet; Lizenztexte liegen jeweils daneben.

## Neue Anliegen-Seite bauen (Anleitung für den nächsten Durchgang)

1. `anliegen/familienstreit.html` kopieren nach `anliegen/<slug>.html`.
   Slugs: `kind-teenager`, `partnerschaft`, `trennung-patchwork`, `ueberforderung`, `lebensuebergaenge`.
2. Tuch der Bühne tauschen (`<div class="buehne tuch tuch-…">`) und `theme-color`:

   | Seite | Tuch | Teller | Tasse |
   |---|---|---|---|
   | familienstreit | `tuch-himbeer` | `teller-familienstreit.svg` | `tasse-kobalt.svg` |
   | kind-teenager | `tuch-kobalt` | `teller-kind-teenager.svg` | `tasse-senf.svg` |
   | partnerschaft | `tuch-tanne` | `teller-partnerschaft.svg` | `tasse-senf.svg` |
   | trennung-patchwork | `tuch-pflaume` | `teller-trennung-patchwork.svg` | `tasse-kobalt.svg` |
   | ueberforderung | `tuch-senf` | `teller-ueberforderung.svg` | `tasse-kobalt.svg` |
   | lebensuebergaenge | `tuch-rose` (dunkler Text) | `teller-lebensuebergaenge.svg` | `tasse-senf.svg` |

   Folgen zwei gleiche Tücher aufeinander, das mittlere Tuch der Seite anders wählen (z. B. Kobalt-Abschnitt
   „Wie es im Gespräch läuft“ auf einer Kobalt-Seite durch `tuch-tanne` ersetzen).
3. Inhalte aus v2 (`../../anliegen/<slug>.html`) übernehmen: Zitat ins `.etikett`, Titel in `h1`,
   Szenen in `.deckel` (genau 4 passen am besten), Hilfe-Punkte in `.hilfe`, Kurzantwort + erste Schritte,
   Grenze-Satz. Die Hilfe-Symbole sind handgezeichnete Inline-SVGs (Strich 2,2, weiß + `#F9CB6B`); auf hellen
   Tüchern Strichfarbe `#2A1E22` und Akzent `#B8254E` verwenden.
4. Bei „Vielleicht liegt auch das auf deinem Tisch“ den eigenen Teller herausnehmen und die anderen fünf verlinken.
5. JSON-LD anpassen (Breadcrumb, Service, FAQPage), Basis `https://andreasgrundke-ops.github.io/entwurf-mar-2610/v3/`.
6. Prüfen: 390 px ohne horizontales Scrollen, Verbotswörter (Therapie, Behandlung, heilen, Patient, Diagnose)
   nur in der Abgrenzung, Status „in Weiterbildung“ nicht zusätzlich in den Fließtext.

## SVGs neu erzeugen

`node _quellen/svg-generator.mjs assets/svg <pfad-für-hero-fragment>` schreibt alle Teller, Tassen, Gewebe,
Borte, Mobile und den Hero-Tisch. Das Hero-Fragment danach mit
`node _quellen/baue-index.mjs _quellen/index.vorlage.html <hero-fragment> assets/svg/mobile.svg index.html`
in die Startseite einsetzen. `gewebe-hell.svg` ist eine abgeschwächte Kopie von `gewebe.svg` für helle Tücher.
Achtung: `baue-index.mjs` überschreibt `index.html`; Änderungen also in der Vorlage machen.

## Bewegung

Ein Moment: Beim Laden werden Teller und Tassen nacheinander „hingestellt“ (CSS, nur mit Klasse `.js`,
Ausgangszustand ohne Animation ist der gedeckte Tisch). Signatur: Teller heben und drehen sich bei Hover und
Tastaturfokus. `prefers-reduced-motion: reduce` schaltet alles ab.

## Nachtrag v3.0.1 (19.10.2026)
- Startseite unten: Fragen als Tischkarten (`.fragen`), Kontaktformular als Reservierungskarte (`.formkarte__reserviert`), Requisit `assets/svg/brotkorb.svg` (erzeugt von `_quellen/brotkorb-generator.mjs`).
- Druck: Flyer und Visitenkarte nutzen statische Schnitte „Figtree Druck“ (`assets/fonts/figtree-static/`) und `flyer/druck-vektor.js` für vektorielle Muster im PDF.
- Verbindliche Gestaltungsregeln: `DESIGN.md` im Repo-Root (nicht veröffentlicht).

## Nachtrag v3.0.2 (19.10.2026)

- Neue Seite `konzept/index.html` (Hub-Stil, `css/konzept.css` ergänzt `css/hub.css`): Idee „Am Küchentisch“,
  Gegenüberstellung zu typischen Schwächen anderer Beratungsseiten (ohne Namen), Inhalt des Pakets, Technik in
  einfachen Worten, Fragen an Marion als aufklappbare Liste, KI-Hinweis.
- Hub: Kachel „Konzept & Fragen an dich“ oben, QR-Kasten unten.
- QR-Codes unter `assets/qr/` (Anrufen, Kontakt als vCard, grundke-it.de/tree) plus `andreas-grundke.vcf`.
  Erzeugt lokal mit `_quellen/qr-generator.mjs` (npm `qrcode`, Fehlerkorrektur M, kein externer Dienst):
  `QRCODE_LIB=<pfad>/node_modules/qrcode node _quellen/qr-generator.mjs` aus `v3/`.
