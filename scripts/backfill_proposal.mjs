/**
 * Registra a posteriori una proposta arrivata solo via mail.
 *
 * Prima di `66a1ac5` la proposta di un canto nuovo esisteva unicamente come
 * mail a RECIPIENT_EMAIL: nessun documento in `proposed_songs`, quindi niente
 * da approvare e nessuno a cui dire che il canto e' stato pubblicato. Questo
 * script ricostruisce il documento — gia' in stato 'approved', perche' il
 * canto e' gia' in catalogo — e lascia l'avviso sul profilo di chi l'aveva
 * proposto.
 *
 * E' idempotente: rilanciarlo aggiorna lo stesso documento (l'id lo si passa
 * con --doc-id, altrimenti lo deriva dal songId) e non duplica l'avviso.
 *
 * Uso:
 *   node scripts/backfill_proposal.mjs --song-id 234 \
 *     --user-id gNTd... --email tizio@example.com \
 *     [--doc-id backfill-234] [--no-notify] [--create-profile]
 *
 * Nome, file, autore e link vengono letti dal catalogo statico; il ChordPro
 * dal .crd corrispondente.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Timestamp } from 'firebase-admin/firestore';
import {
  PROPOSED_SONGS_COLLECTION,
  initAdmin,
  pushUserNotification
} from './lib/pending_queue.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

const songId = flag('song-id');
const userId = flag('user-id');
const email = flag('email') ?? '';
if (!songId || !userId) {
  die(
    'Uso: node scripts/backfill_proposal.mjs --song-id <id> --user-id <uid> [--email <mail>] [--doc-id <id>] [--no-notify]'
  );
}
const docId = flag('doc-id') ?? `backfill-song-${songId}`;

const catalog = JSON.parse(
  await readFile(path.join(REPO_ROOT, 'logic/songs.config.json'), 'utf8')
);
const song = catalog.find((s) => String(s.Id) === String(songId));
if (!song) die(`Nessun canto con Id ${songId} in logic/songs.config.json.`);

const chordpro = await readFile(
  path.join(REPO_ROOT, 'public/accordi', song['Nome file']),
  'utf8'
);

const { db } = await initAdmin();
const ref = db.collection(PROPOSED_SONGS_COLLECTION).doc(docId);

await ref.set(
  {
    name: song.Nome,
    author: song.Autore ?? '',
    linkSong: song.Link ?? '',
    linkChords: '',
    chordpro,
    userId,
    email,
    state: 'approved',
    songId: String(songId),
    nameFile: song['Nome file'],
    creationTime: Timestamp.now(),
    /* Traccia che il documento non nasce da una proposta dall'app. */
    backfilled: true
  },
  { merge: true }
);
console.log(`Proposta "${song.Nome}" registrata come ${docId} (id ${songId}).`);

/**
 * L'avviso vive sul profilo: se il profilo non c'e' non ha dove stare. Chi si
 * e' registrato con mail e password prima della correzione in
 * `logic/server/auth.ts` non ce l'ha mai avuto. Ricrearlo e' un atto
 * esplicito, non un effetto collaterale dell'approvazione.
 */
if (args.includes('--create-profile')) {
  const profile = db.collection('users').doc(userId);
  if ((await profile.get()).exists) {
    console.log(`Profilo ${userId} gia' presente, lasciato com'e'.`);
  } else {
    await profile.set({
      favoriteSongs: [],
      sharedPlaylists: [],
      ownedSongs: [],
      ownedParts: [],
      counter_pending_songs: 0,
      counter_pending_parts: 0
    });
    console.log(`Profilo ${userId} creato (era assente).`);
  }
}

if (!args.includes('--no-notify')) {
  const sent = await pushUserNotification(db, userId, {
    id: `song:${docId}`,
    type: 'song_published',
    songId: String(songId),
    songName: song.Nome,
    createdAt: Date.now()
  });
  console.log(
    sent
      ? `Avviso lasciato sul profilo ${userId}.`
      : `Nessun avviso lasciato: profilo ${userId} inesistente o avviso gia' presente.`
  );
}
