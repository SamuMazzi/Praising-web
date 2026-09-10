/**
 * Reads the review queue straight from Firestore.
 *
 * The queue is the set of `songs/{songId}/versions/{versionId}` and
 * `songs/{songId}/parts/{partId}` documents still in state 'pending'. It used
 * to be discoverable only through the notification emails, which are one-shot:
 * if a send failed the submission stayed pending forever. Reading the state
 * back out of the database makes the queue recoverable at any time.
 *
 * Shared by the GitHub Action reporter and the local maintenance CLI.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import nextEnv from '@next/env';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

/**
 * Gli script girano con node puro, che a differenza di `next` non legge da
 * solo `.env.local`: senza questo, le credenziali andrebbero esportate a mano
 * a ogni comando. Logger muto per non sporcare l'output del build.
 */
nextEnv.loadEnvConfig(REPO_ROOT, false, { info: () => {}, error: () => {} });

export const PROJECT_ID = 'praising-web';
export const STORAGE_BUCKET = 'praising-web.appspot.com';
export const SITE_BASE = 'https://praising.vercel.app';

/**
 * Credentials come from FIREBASE_SERVICE_ACCOUNT (the raw JSON, how the GitHub
 * Action passes it) or from GOOGLE_APPLICATION_CREDENTIALS (a file path, the
 * usual local setup).
 */
const loadCredential = async () => {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inline) {
    try {
      return cert(JSON.parse(inline));
    } catch (e) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${e.message}`
      );
    }
  }
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (file) {
    return cert(JSON.parse(await readFile(file, 'utf8')));
  }
  throw new Error(
    'No credentials: set FIREBASE_SERVICE_ACCOUNT (JSON) or GOOGLE_APPLICATION_CREDENTIALS (path to the key file).'
  );
};

export const PROPOSED_SONGS_COLLECTION = 'proposed_songs';

export const OWNED_FIELD = { version: 'ownedSongs', part: 'ownedParts' };
export const COUNTER_FIELD = {
  version: 'counter_pending_songs',
  part: 'counter_pending_parts'
};

export const initAdmin = async () => {
  if (getApps().length === 0) {
    initializeApp({
      credential: await loadCredential(),
      projectId: PROJECT_ID,
      storageBucket: STORAGE_BUCKET
    });
  }
  return { db: getFirestore(), auth: getAuth() };
};

/** Song id -> display name, from the static catalog. */
const loadSongNames = async () => {
  const raw = await readFile(
    path.join(REPO_ROOT, 'logic/songs.config.json'),
    'utf8'
  );
  return new Map(JSON.parse(raw).map((s) => [String(s.Id), s.Nome]));
};

/** Emails live in Firebase Auth, never in Firestore. */
const resolveEmails = async (auth, uids) => {
  const emails = new Map();
  const unique = [...new Set(uids.filter(Boolean))];
  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100).map((uid) => ({ uid }));
    const { users } = await auth.getUsers(chunk);
    for (const user of users) {
      emails.set(
        user.uid,
        user.email ?? (user.providerData.length === 0 ? '(anonimo)' : '')
      );
    }
  }
  return emails;
};

/**
 * Lascia un avviso sul profilo dell'utente, che l'app mostra al prossimo
 * avvio (`components/notification_song_published.tsx`).
 *
 * Sta sul documento `users/{uid}` e non su `proposed_songs` perche' quello
 * l'app lo legge gia': nessuna query in piu' e nessuna regola nuova. L'`id`
 * e' stabile per proposta, cosi' rilanciare il comando non crea doppioni.
 */
export const pushUserNotification = async (db, userId, notification) => {
  if (!userId) return false;
  const ref = db.collection('users').doc(userId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const existing = snap.data().notifications ?? [];
  if (existing.some((n) => n.id === notification.id)) return false;
  await ref.update({
    notifications: FieldValue.arrayUnion(notification)
  });
  return true;
};

const daysSince = (date) =>
  (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

/**
 * `author` holds the uid on versions but a typed display name on parts, where
 * the uid lives in `userId`. Old version documents predate `userId` entirely.
 */
export const uidOf = (kind, data) =>
  kind === 'version' ? (data.userId ?? data.author) : data.userId;

const readGroup = async (db, collectionId, kind) => {
  const snap = await db
    .collectionGroup(collectionId)
    .where('state', '==', 'pending')
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    const songId = doc.ref.parent.parent?.id ?? '?';
    const createdAt = data.creationTime?.toDate?.() ?? new Date(0);
    return {
      kind,
      songId,
      docId: doc.id,
      docPath: doc.ref.path,
      uid: uidOf(kind, data),
      authorName: kind === 'part' ? data.author : undefined,
      partName: data.name,
      createdAt,
      ageDays: daysSince(createdAt),
      storagePath:
        kind === 'version'
          ? `songs/${songId}/${doc.id}.crd`
          : `songs/${songId}/parts/${doc.id}.mp3`,
      previewUrl:
        kind === 'version'
          ? `${SITE_BASE}/songs/${songId}?v=${doc.id}`
          : `${SITE_BASE}/songs/${songId}/parts`
    };
  });
};

/**
 * A submission writes the Firestore document first and the file second, so a
 * failure in between leaves a document with nothing behind it. Needs read
 * access to Storage, which the read-only Action credential does not have.
 */
/**
 * Proposte di canti nuovi.
 *
 * A differenza di versioni e parti non stanno sotto `songs/{songId}`: un
 * canto proposto un songId non ce l'ha ancora, glielo assegna
 * l'approvazione. Il ChordPro sta in un campo del documento, e la `.select()`
 * lo lascia deliberatamente fuori: la lista non deve scaricare il testo di
 * ogni proposta per stampare due righe di riepilogo.
 */
const readProposedSongs = async (db) => {
  const snap = await db
    .collection(PROPOSED_SONGS_COLLECTION)
    .where('state', '==', 'pending')
    .select(
      'name',
      'author',
      'linkSong',
      'linkChords',
      'userId',
      'creationTime'
    )
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    const createdAt = data.creationTime?.toDate?.() ?? new Date(0);
    return {
      kind: 'song',
      docId: doc.id,
      docPath: doc.ref.path,
      uid: data.userId,
      songName: data.name || '(senza titolo)',
      authorName: data.author || undefined,
      linkSong: data.linkSong,
      linkChords: data.linkChords,
      createdAt,
      ageDays: daysSince(createdAt)
    };
  });
};

const flagMissingFiles = async (items) => {
  const bucket = getStorage().bucket();
  await Promise.all(
    items.map(async (item) => {
      if (!item.storagePath) return;
      try {
        const [exists] = await bucket.file(item.storagePath).exists();
        item.fileMissing = !exists;
      } catch {
        item.fileMissing = undefined;
      }
    })
  );
};

export const fetchPendingQueue = async ({ checkStorage = false } = {}) => {
  const { db, auth } = await initAdmin();
  const [songNames, versions, parts, proposals] = await Promise.all([
    loadSongNames(),
    readGroup(db, 'versions', 'version'),
    readGroup(db, 'parts', 'part'),
    readProposedSongs(db)
  ]);

  const items = [...versions, ...parts, ...proposals].sort(
    (a, b) => a.createdAt - b.createdAt
  );
  const emails = await resolveEmails(
    auth,
    items.map((i) => i.uid)
  );

  for (const item of items) {
    if (item.kind !== 'song') {
      item.songName =
        songNames.get(item.songId) ?? `(canto sconosciuto ${item.songId})`;
    }
    item.email = emails.get(item.uid) ?? '(utente non trovato)';
  }

  if (checkStorage) {
    await flagMissingFiles(items);
  }
  return items;
};
