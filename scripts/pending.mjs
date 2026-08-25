/**
 * Local maintenance CLI for the review queue.
 *
 * The GitHub Action reports what is pending; this is how you act on it.
 * `approve` performs, atomically, the two steps that were previously done by
 * hand in the Firestore console (see the note in logic/server/database.ts):
 * flip the state to 'approved' and decrement the owner's pending counter. Doing
 * them in one batch is what stops the counters drifting apart.
 *
 * Usage:
 *   npm run pending                          list the queue
 *   npm run pending -- list --check-storage  also flag documents with no file
 *   npm run pending -- approve version 42 abc123
 *   npm run pending -- reject  part    42 def456
 *   npm run pending -- recount [--fix]       repair drifted pending counters
 */
import { FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import {
  COUNTER_FIELD,
  OWNED_FIELD,
  fetchPendingQueue,
  initAdmin,
  uidOf
} from './lib/pending_queue.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));
const command = positional[0] ?? 'list';

const COLLECTION = { version: 'versions', part: 'parts' };

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

const docRefFor = (db, kind, songId, docId) =>
  db.collection('songs').doc(songId).collection(COLLECTION[kind]).doc(docId);

const list = async () => {
  const items = await fetchPendingQueue({
    checkStorage: flags.has('--check-storage')
  });
  if (items.length === 0) {
    console.log('Nessun contributo in attesa.');
    return;
  }
  console.log(`${items.length} contributi in attesa (dal più vecchio):\n`);
  for (const i of items) {
    const what =
      i.kind === 'version' ? 'versione' : `parte "${i.partName ?? '?'}"`;
    const who = i.authorName ? `${i.authorName} <${i.email}>` : `<${i.email}>`;
    console.log(`  ${what} — ${i.songName}`);
    console.log(`    da ${who}, in attesa da ${Math.floor(i.ageDays)} giorni`);
    console.log(`    ${i.previewUrl}`);
    if (i.fileMissing === true) {
      console.log(`    ❌ nessun file in storage: ${i.storagePath}`);
    }
    console.log(
      `    approva: npm run pending -- approve ${i.kind} ${i.songId} ${i.docId}`
    );
    console.log('');
  }
};

const requireTarget = () => {
  const [, kind, songId, docId] = positional;
  if (!COLLECTION[kind] || !songId || !docId) {
    die(`Uso: npm run pending -- ${command} <version|part> <songId> <docId>`);
  }
  return { kind, songId, docId };
};

const approve = async () => {
  const { kind, songId, docId } = requireTarget();
  const { db } = await initAdmin();
  const ref = docRefFor(db, kind, songId, docId);
  const snap = await ref.get();
  if (!snap.exists) die(`Documento non trovato: ${ref.path}`);

  const data = snap.data();
  if (data.state !== 'pending') {
    console.log(`Già in stato '${data.state}', niente da fare.`);
    return;
  }
  const uid = uidOf(kind, data);

  const batch = db.batch();
  batch.update(ref, { state: 'approved' });
  if (uid) {
    batch.update(db.collection('users').doc(uid), {
      [COUNTER_FIELD[kind]]: FieldValue.increment(-1)
    });
  }
  await batch.commit();
  console.log(
    `Approvato ${ref.path}${uid ? ` (contatore di ${uid} decrementato)` : ''}.`
  );
};

const reject = async () => {
  const { kind, songId, docId } = requireTarget();
  const { db } = await initAdmin();
  const ref = docRefFor(db, kind, songId, docId);
  const snap = await ref.get();
  if (!snap.exists) die(`Documento non trovato: ${ref.path}`);

  const data = snap.data();
  const uid = uidOf(kind, data);
  const wasPending = data.state === 'pending';

  const batch = db.batch();
  batch.delete(ref);
  if (uid) {
    batch.update(db.collection('users').doc(uid), {
      [OWNED_FIELD[kind]]: FieldValue.arrayRemove(ref.path),
      ...(wasPending ? { [COUNTER_FIELD[kind]]: FieldValue.increment(-1) } : {})
    });
  }
  await batch.commit();

  const storagePath =
    kind === 'version'
      ? `songs/${songId}/${docId}.crd`
      : `songs/${songId}/parts/${docId}.mp3`;
  try {
    await getStorage().bucket().file(storagePath).delete();
    console.log(`Rifiutato ${ref.path} e rimosso ${storagePath}.`);
  } catch (e) {
    console.log(`Rifiutato ${ref.path}. File non rimosso (${e.message}).`);
  }
};

/**
 * Counters drifted for two reasons: notifications that never arrived left
 * submissions pending forever, and deletions used to array-remove from a
 * misspelled field. So trust the documents, never the stored counters.
 */
const recount = async () => {
  const { db } = await initAdmin();
  const actual = new Map();

  for (const [kind, collectionId] of Object.entries(COLLECTION)) {
    const snap = await db
      .collectionGroup(collectionId)
      .where('state', '==', 'pending')
      .get();
    for (const doc of snap.docs) {
      const uid = uidOf(kind, doc.data());
      if (!uid) continue;
      const entry = actual.get(uid) ?? { version: 0, part: 0 };
      entry[kind] += 1;
      actual.set(uid, entry);
    }
  }

  const users = await db.collection('users').get();
  const drifted = [];
  for (const user of users.docs) {
    const data = user.data();
    const real = actual.get(user.id) ?? { version: 0, part: 0 };
    const stored = {
      version: data.counter_pending_songs ?? 0,
      part: data.counter_pending_parts ?? 0
    };
    if (stored.version !== real.version || stored.part !== real.part) {
      drifted.push({ uid: user.id, stored, real });
    }
  }

  if (drifted.length === 0) {
    console.log('Tutti i contatori sono corretti.');
    return;
  }

  console.log(`${drifted.length} utenti con contatori sbagliati:\n`);
  for (const d of drifted) {
    const blocked =
      d.stored.version > 10 ? '  ← bloccato dal limite di 10' : '';
    console.log(
      `  ${d.uid}: canti ${d.stored.version} -> ${d.real.version}, ` +
        `parti ${d.stored.part} -> ${d.real.part}${blocked}`
    );
  }

  if (!flags.has('--fix')) {
    console.log('\nRilancia con --fix per correggerli.');
    return;
  }

  // Firestore caps a batch at 500 writes.
  const CHUNK = 400;
  for (let i = 0; i < drifted.length; i += CHUNK) {
    const batch = db.batch();
    for (const d of drifted.slice(i, i + CHUNK)) {
      batch.update(db.collection('users').doc(d.uid), {
        counter_pending_songs: d.real.version,
        counter_pending_parts: d.real.part
      });
    }
    await batch.commit();
  }
  console.log(`\nCorretti ${drifted.length} utenti.`);
};

const commands = { list, approve, reject, recount };

const run = commands[command];
if (!run) {
  die(
    `Comando sconosciuto '${command}'. Disponibili: ${Object.keys(commands).join(', ')}.`
  );
}
run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
