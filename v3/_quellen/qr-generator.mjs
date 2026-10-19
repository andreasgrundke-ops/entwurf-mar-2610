/**
 * qr-generator.mjs – QR-Codes fuer Hub und Konzeptseite (Entwurf v3)
 *
 * Version:      1.0
 * Autor:        Grundke IT-Service
 * Datum:        19.10.2026
 * Beschreibung: Erzeugt drei SVG-QR-Codes und eine vCard-Datei unter v3/assets/qr/.
 *               Lokal mit der npm-Bibliothek "qrcode", kein externer Dienst.
 *
 * Aufruf (aus v3/):
 *   NODE_PATH=<pfad-zu>/node_modules node _quellen/qr-generator.mjs
 *   oder QRCODE_LIB=<absoluter pfad zu node_modules/qrcode> setzen.
 *
 * Ablauf:
 *   1. Bibliothek laden (QRCODE_LIB oder Paketname "qrcode")
 *   2. Inhalte festlegen: Anrufen (tel:), Kontakt (vCard 3.0), Linkseite
 *   3. SVGs schreiben (Fehlerkorrektur M, CI-Blau auf transparent)
 *   4. vCard-Datei zum Herunterladen schreiben, Inhalte ausgeben
 *
 * Aenderungshistorie:
 *   1.0  19.10.2026  Erstausgabe
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'assets', 'qr');

const lib = process.env.QRCODE_LIB;
const QRCode = lib
  ? (await import(pathToFileURL(join(lib, 'lib', 'index.js')).href)).default
  : createRequire(import.meta.url)('qrcode');

const opts = {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#0c4da2ff', light: '#ffffffff' },
};

const TEL = 'tel:+491782584438';
const TREE = 'https://grundke-it.de/tree';
const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Grundke;Andreas;;;',
  'FN:Andreas Grundke',
  'ORG:Grundke IT-Service',
  'TEL;TYPE=CELL:+491782584438',
  'EMAIL:info@grundke-it.de',
  'URL:https://grundke-it.de',
  'ADR;TYPE=WORK:;;Beethovenring 16;Grasbrunn;;85630;Deutschland',
  'END:VCARD',
].join('\r\n');

await mkdir(outDir, { recursive: true });
const ziele = [
  ['qr-anrufen.svg', TEL],
  ['qr-kontakt.svg', VCARD],
  ['qr-tree.svg', TREE],
];
for (const [datei, inhalt] of ziele) {
  const svg = await QRCode.toString(inhalt, opts);
  await writeFile(join(outDir, datei), svg, 'utf8');
  console.log(`${datei}  ->  ${inhalt.replace(/\r\n/g, ' | ')}`);
}
await writeFile(join(outDir, 'andreas-grundke.vcf'), VCARD + '\r\n', 'utf8');
console.log('andreas-grundke.vcf geschrieben');
