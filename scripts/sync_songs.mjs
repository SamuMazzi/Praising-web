/**
 * Materializza in build i canti approvati che vivono su Firestore.
 *
 * Il catalogo canonico resta statico: `logic/songs.config.json` piu' i file
 * in `public/accordi`. E' quello che rende possibile il precache offline
 * (l'elenco dei file deve essere noto al build) e la generazione statica
 * delle pagine canto per Google. Firestore e' il *punto di ingresso* delle
 * proposte, non il posto da cui l'app legge.
 *
 * Questo script e' la cerniera fra i due: legge le proposte in stato
 * 'approved' e scrive il `.crd` e la voce di catalogo corrispondenti. E' una
 * proiezione pura, senza scritture su Firestore, cosi' puo' girare anche
 * dalle build di preview con credenziali di sola lettura.
 *
 * Gli id li assegna `npm run pending -- approve song`, non questo script:
 * devono restare stabili fra un build e l'altro, altrimenti l'URL di un
 * canto gia' pubblicato cambierebbe a ogni deploy.
 *
 * Senza credenziali non fallisce: salta e lascia il catalogo com'e', cosi'
 * un clone del repo continua a buildare senza accesso a Firebase.
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PROPOSED_SONGS_COLLECTION, initAdmin } from './lib/pending_queue.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const CATALOG = path.join(REPO_ROOT, 'logic/songs.config.json');
const CHORDS_DIR = path.join(REPO_ROOT, 'public/accordi');

const hasCredentials = () =>
  Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

const fileExists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  if (!hasCredentials()) {
    console.log(
      '[sync-songs] Nessuna credenziale Firebase: salto, uso il catalogo del repo.'
    );
    return;
  }

  const { db } = await initAdmin();
  const snap = await db
    .collection(PROPOSED_SONGS_COLLECTION)
    .where('state', '==', 'approved')
    .get();

  if (snap.empty) {
    console.log('[sync-songs] Nessun canto approvato da pubblicare.');
    return;
  }

  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'));
  const byId = new Map(catalog.map((song) => [String(song.Id), song]));
  let added = 0;
  let written = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const { songId, nameFile, chordpro } = data;

    // Approvazione incompleta: meglio saltare che pubblicare un canto rotto.
    if (!songId || !nameFile || !chordpro?.trim()) {
      console.warn(
        `[sync-songs] Proposta ${doc.id} approvata ma incompleta (id/file/accordi): saltata.`
      );
      continue;
    }

    const target = path.join(CHORDS_DIR, nameFile);
    const content = chordpro.endsWith('\n') ? chordpro : `${chordpro}\n`;
    const current = (await fileExists(target))
      ? await readFile(target, 'utf8')
      : null;
    if (current !== content) {
      await writeFile(target, content, 'utf8');
      written += 1;
    }

    if (!byId.has(String(songId))) {
      catalog.push({
        Nome: data.name ?? `Canto ${songId}`,
        'Nome file': nameFile,
        Caratteristica: data.caratteristica ?? '',
        'Parte della messa': data.parteMessa ?? '',
        Link: data.linkSong ?? '',
        Autore: data.author ?? '',
        Id: Number(songId)
      });
      added += 1;
    }
  }

  if (added > 0) {
    catalog.sort((a, b) => Number(a.Id) - Number(b.Id));
    await writeFile(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  }

  console.log(
    `[sync-songs] ${snap.size} canti approvati: ${added} aggiunti al catalogo, ${written} file scritti.`
  );
};

main().catch((e) => {
  // Un errore qui non deve far fallire il deploy dell'app esistente.
  console.error(
    `[sync-songs] Errore, catalogo lasciato invariato: ${e.message}`
  );
});
