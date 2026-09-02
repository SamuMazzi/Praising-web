import app from './firebase_config';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  getDocs,
  deleteDoc,
  query,
  where,
  or,
  increment,
  type DocumentSnapshot,
  onSnapshot,
  type Unsubscribe,
  persistentLocalCache,
  persistentMultipleTabManager,
  initializeFirestore,
  getDocFromCache
} from 'firebase/firestore';
import {
  deleteModifiedSongFromServerStorage,
  deletePartSongFromServerStorage
} from './storage';
// import geofire from 'geofire-common';

// This will be really useful to manage the database
// TODO: https://firebase.google.com/docs/firestore/query-data/get-data#custom_objects

// TODO: Implement caching
// FIXME: Maybe this doesn't work only in local dev
let firestoreInit = false;
const getRealFirestore = () => {
  if (!firestoreInit && process.env.NODE_ENV === 'production') {
    firestoreInit = true;
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  }
  return getFirestore(app);
};
const firestore = getRealFirestore();
const USERS_COLLECTION = 'users';
const CUSTOM_SONGS_COLLECTION = 'songs';
const VERSIONS_CUSTOM_SONGS_COLLECTION = 'versions';
const PARTS_SONGS_COLLECTION = 'parts';
const PLAYLIST_COLLECTION = 'playlist';
const PROPOSED_SONGS_COLLECTION = 'proposed_songs';

export interface Playlist {
  name: string;
  songs: string[];
  id: string;
  owner: string;
  notes?: string;
  shared: boolean /* Probably this is still not really exploited */;
  creationTime: Timestamp | number;
  lastModified: Timestamp | number;
}

/* PLAYLIST */
const convertTimestampToDatePlaylist = (
  p: Playlist,
  convertLocal?: boolean,
  timestampNow?: Timestamp
) => {
  const t = timestampNow ?? Timestamp.now();
  return {
    ...p,
    creationTime: convertLocal ? t.toMillis() : timestampNow,
    lastModified: convertLocal ? t.toMillis() : timestampNow
  } as Playlist;
};

export const addServerPlaylist = async (
  userId: string,
  name: string,
  songs: string[],
  options?: { convertLocal?: boolean }
): Promise<Playlist> => {
  const timestampNow = Timestamp.now();
  const onlinePlaylist: Omit<Playlist, 'id'> = {
    name,
    songs,
    owner: userId,
    creationTime: timestampNow,
    lastModified: timestampNow,
    shared: false
  };
  const docRef = await addDoc(
    collection(firestore, PLAYLIST_COLLECTION),
    onlinePlaylist
  );
  return convertTimestampToDatePlaylist(
    {
      ...onlinePlaylist,
      id: docRef.id
    },
    options?.convertLocal,
    timestampNow
  );
};

export const setServerPlaylist = async (playlist: Playlist) => {
  // TODO: Understand why the times can be undefined when you share them (maybe not really problem now)
  const newPlaylist = {
    ...playlist,
    lastModified:
      typeof playlist.lastModified === 'number'
        ? Timestamp.fromMillis(playlist.lastModified)
        : playlist.lastModified === undefined
          ? Timestamp.now()
          : playlist.lastModified,
    creationTime:
      typeof playlist.creationTime === 'number'
        ? Timestamp.fromMillis(playlist.creationTime)
        : playlist.creationTime === undefined
          ? Timestamp.now()
          : playlist.creationTime
  };
  await setDoc(doc(firestore, PLAYLIST_COLLECTION, playlist.id), newPlaylist);
};

export const getMyPlaylists = async (
  userId: string,
  options?: { convertLocal?: boolean }
): Promise<Promise<Record<string, Playlist>>> => {
  const playlistColl = collection(firestore, PLAYLIST_COLLECTION);
  const q = query(playlistColl, where('owner', '==', userId));

  const docRef = await getDocs(q);
  return docRef.docs
    .map((doc) => {
      return convertTimestampToDatePlaylist(
        {
          ...doc.data(),
          id: doc.id
        } as Playlist,
        options?.convertLocal
      );
    })
    .reduce((a, v) => ({ ...a, [v.id]: v }), {});
};

export const deleteServerPlaylist = async (playlistId: string) => {
  await deleteDoc(doc(firestore, PLAYLIST_COLLECTION, playlistId));
};

// Get all the playlists that have been shared with me
export const getSharedPlaylists = async (
  sharedPlaylist: string[] /* Array of playlist id, got from user profile */,
  options?: { convertLocal?: boolean }
): Promise<Record<string, Playlist>> => {
  const futures: Promise<DocumentSnapshot>[] = [];
  for (const playlistId of sharedPlaylist) {
    futures.push(getDoc(doc(firestore, PLAYLIST_COLLECTION, playlistId)));
  }
  const playlists = await Promise.all(futures);
  return playlists
    .map((doc) => {
      return convertTimestampToDatePlaylist(
        {
          ...doc.data(),
          id: doc.id
        } as Playlist,
        options?.convertLocal
      );
    })
    .reduce((a, v) => ({ ...a, [v.id]: v }), {});
};

export const addSharedPlaylist = async (userId: string, playlistId: string) => {
  await setDoc(
    doc(firestore, USERS_COLLECTION, userId),
    {
      sharedPlaylists: arrayUnion(playlistId)
    },
    { merge: true }
  );
};

export const removeSharedPlaylist = async (
  userId: string,
  playlistId: string
) => {
  await setDoc(
    doc(firestore, USERS_COLLECTION, userId),
    {
      sharedPlaylists: arrayRemove(playlistId)
    },
    { merge: true }
  );
};

export const getServerSinglePlaylist = async (
  idPlaylist: string
): Promise<Playlist | null> => {
  const docRef = doc(firestore, PLAYLIST_COLLECTION, idPlaylist);
  const initialSnap = await getDoc(docRef);
  if (!initialSnap.exists()) {
    return null;
  }
  return { ...initialSnap.data(), id: initialSnap.id } as Playlist;
};

export const listenOnSinglePlaylist = (
  idPlaylist: string,
  onChange: (playlist: Playlist | null) => void
): Unsubscribe => {
  const unsubscribe = onSnapshot(
    doc(firestore, PLAYLIST_COLLECTION, idPlaylist),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      const newPlaylist = { ...snapshot.data(), id: snapshot.id } as Playlist;
      onChange(newPlaylist);
    },
    (error) => {
      console.error('Error snapshot listener', error);
    }
  );
  return unsubscribe;
};

/*
export const getActiveSessions = async (center: [number, number], radius_meters: number) => {
    // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
    // a separate query for each pair. There can be up to 9 pairs of bounds
    // depending on overlap, but in most cases there are 4.
    const bounds = geofire.geohashQueryBounds(center, radius_meters);
    const promises = [];
    for (const b of bounds) {
        const q = query(
            collection(firestore, 'sessions'), 
            orderBy('geohash'), 
            startAt(b[0]), 
            endAt(b[1]));
            //TODO: Where owner != me

        promises.push(getDocs(q));
    }

    // Collect all the query results together into a single list
    const snapshots = await Promise.all(promises);

    const matchingDocs = [];
    for (const snap of snapshots) {
        for (const doc of snap.docs) {
            const lat = doc.get('lat');
            const lng = doc.get('lng');

            // We have to filter out a few false positives due to GeoHash
            // accuracy, but most will match
            const distanceInKm = geofire.distanceBetween([lat, lng], center);
            const distanceInM = distanceInKm * 1000;
            if (distanceInM <= radius_meters) {
                matchingDocs.push(doc);
            }
        }
    }
    return matchingDocs;
}

interface ServerSession {
    name: string
    lat: number
    lng: number
    owner: string
    geohash: string
}

export const addActiveSession = async (name: string, center: [number, number]) => {
    //TODO: Make it delete itself after a while

    const hash = geofire.geohashForLocation(center);
    const serverSession: ServerSession = {
        name: name,
        lat: center[0],
        lng: center[1],
        owner: "", //TODO: Add personal id
        geohash: hash
    }
    const docRef = await addDoc(collection(firestore, "sessions"), serverSession);
    return docRef.id
}
*/

/**
 * When approving a song:
 * 1. Change status of song to 'approved'
 * 2. Decrement counter_pending_songs in user
 */

export const addServerFavoriteSongs = async (
  userId: string,
  newSong: string
): Promise<void> => {
  await updateDoc(doc(firestore, USERS_COLLECTION, userId), {
    favoriteSongs: arrayUnion(newSong)
  });
};

export const removeServerFavoriteSongs = async (
  userId: string,
  newSong: string
): Promise<void> => {
  await updateDoc(doc(firestore, USERS_COLLECTION, userId), {
    favoriteSongs: arrayRemove(newSong)
  });
};

export const addUserToDatabase = async (
  userId: string,
  oldInfoUser: UserDatabase
) => {
  const userInfo: UserDatabase = {
    favoriteSongs: [],
    sharedPlaylists: [],
    ownedSongs: [],
    ownedParts: [],
    counter_pending_songs: 0,
    counter_pending_parts: 0
  };
  await setDoc(doc(firestore, USERS_COLLECTION, userId), {
    ...userInfo,
    ...oldInfoUser
  });
  return userInfo;
};

export interface UserDatabase {
  favoriteSongs?: string[];
  sharedPlaylists?: string[] /* Array of playlist id got from other users */;
  ownedSongs?: string[];
  ownedParts?: string[];
  counter_pending_songs?: number;
  counter_pending_parts?: number;
}

export const deleteUserFromDatabase = async (userId: string) => {
  // TODO: Sooner or later we'll need to do this in firebase functions (now there is security issue)
  try {
    await deleteDoc(doc(firestore, USERS_COLLECTION, userId));
  } catch (e) {
    console.error(e);
  }
};

export const getUserFromDatabase = async (
  userId: string,
  options?: { source?: 'cache' | 'server' | 'auto' }
): Promise<UserDatabase | undefined> => {
  try {
    let docRef: DocumentSnapshot<UserDatabase>;
    if (options?.source === 'cache') {
      docRef = await getDocFromCache(doc(firestore, USERS_COLLECTION, userId));
    } else {
      docRef = await getDoc(doc(firestore, USERS_COLLECTION, userId));
    }
    if (!docRef.exists()) return undefined;
    return docRef.data() as UserDatabase;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

/**
 * Proposta di un canto nuovo, cioe' un canto che ancora non esiste nel
 * catalogo statico (`logic/songs.config.json`).
 *
 * Il ChordPro sta in un campo del documento e non su Storage, al contrario
 * delle versioni utente: un canto e' 860 byte in media, e tenerlo qui rende
 * l'approvazione una singola scrittura atomica invece di due passaggi su
 * sistemi diversi che possono divergere. Il testo non deve pero' finire
 * nelle liste: `scripts/lib/pending_queue.mjs` lo esclude con `.select()`.
 *
 * Il documento non viene mai letto dall'app: e' materia della coda di
 * revisione e del build, che da qui genera `.crd` e voce di catalogo.
 */
export interface ProposedSong {
  /** Titolo del canto, come apparira' nel catalogo. */
  name: string;
  author: string;
  /** Link alla canzone (YouTube, Spotify...), come nella proposta storica. */
  linkSong: string;
  /** Link a degli accordi gia' esistenti, se l'utente non li trascrive. */
  linkChords: string;
  /** ChordPro trascritto dall'utente. Vuoto = proposta da lavorare a mano. */
  chordpro: string;
  userId: string;
  email: string;
  state: 'pending' | 'approved';
  creationTime: Timestamp;
  /**
   * Assegnati all'approvazione, non alla proposta: il build deve poter
   * rigenerare sempre gli stessi id, altrimenti a ogni deploy le URL dei
   * canti pubblicati da qui cambierebbero.
   */
  songId?: string;
  nameFile?: string;
}

export const addProposedSong = async (
  proposal: Omit<ProposedSong, 'state' | 'creationTime' | 'songId' | 'nameFile'>
): Promise<string> => {
  const docRef = await addDoc(
    collection(firestore, PROPOSED_SONGS_COLLECTION),
    {
      ...proposal,
      state: 'pending',
      creationTime: Timestamp.now()
    } satisfies Omit<ProposedSong, 'songId' | 'nameFile'>
  );
  return docRef.id;
};

export const addEditedSongToDatabase = async (
  userId: string,
  newSongId: string
): Promise<string> => {
  const newSongDocRef = await addDoc(
    collection(
      firestore,
      CUSTOM_SONGS_COLLECTION,
      newSongId,
      VERSIONS_CUSTOM_SONGS_COLLECTION
    ),
    {
      creationTime: Timestamp.now(),
      lastModified: Timestamp.now(),
      author: userId,
      userId,
      state: 'pending'
    } as Omit<CustomSongInfo, 'versionId'>
  );
  await updateDoc(doc(firestore, USERS_COLLECTION, userId), {
    ownedSongs: arrayUnion(newSongDocRef.path),
    counter_pending_songs: increment(1)
  });
  return newSongDocRef.id;
};

export const deleteEditedSongFromDatabase = async (
  userId: string,
  songId: string,
  idDoc: string
): Promise<void> => {
  const docRef = doc(
    firestore,
    CUSTOM_SONGS_COLLECTION,
    songId,
    VERSIONS_CUSTOM_SONGS_COLLECTION,
    idDoc
  );
  const song = await getInfoEditedSong(songId, idDoc);
  await deleteDoc(docRef);
  await updateDoc(doc(firestore, USERS_COLLECTION, userId), {
    ownedSongs: arrayRemove(docRef.path),
    counter_pending_songs: increment(song.state === 'pending' ? -1 : 0)
  });
  await deleteModifiedSongFromServerStorage(idDoc, songId);
};

export const getInfoEditedSong = async (
  songId: string,
  versionId: string
): Promise<CustomSongInfo> => {
  const docSong = doc(
    firestore,
    CUSTOM_SONGS_COLLECTION,
    songId,
    VERSIONS_CUSTOM_SONGS_COLLECTION,
    versionId
  );
  const refDoc = await getDoc(docSong);
  const out = { ...refDoc.data(), versionId: refDoc.id } as CustomSongInfo;
  return out;
};

export const editEditedSongToDatabase = async (
  songId: string,
  idVersion: string
): Promise<void> => {
  await updateDoc(
    doc(
      firestore,
      CUSTOM_SONGS_COLLECTION,
      songId,
      VERSIONS_CUSTOM_SONGS_COLLECTION,
      idVersion
    ),
    {
      lastModified: Timestamp.now()
    }
  );
};

export interface CustomSongInfo {
  versionId: string /* In firebase case the ID of the document */;
  creationTime: Timestamp;
  lastModified: Timestamp;
  /** The uid of who created the version. NB: in PartSongInfo this same field
   * holds a display name instead, so never compare the two across collections. */
  author: string;
  /** Also the uid. Documents created before this field was written are missing
   * it, so queries that must match old versions have to use `author`. */
  userId?: string;
  rates?: number;
  state: 'approved' | 'pending';
}

/**
 * Get all the versions of a song that are approved or that the user has created
 * @param userId
 * @param songId
 * @returns
 */
export const getSongInfoVersions = async (
  userId: string,
  songId: string
): Promise<CustomSongInfo[]> => {
  const customSongCollections = collection(
    firestore,
    CUSTOM_SONGS_COLLECTION,
    songId,
    VERSIONS_CUSTOM_SONGS_COLLECTION
  );
  const q = query(
    customSongCollections,
    or(where('author', '==', userId), where('state', '==', 'approved'))
  );
  const refDocs = await getDocs(q);
  const out = refDocs.docs.map((doc) => {
    return { ...doc.data(), versionId: doc.id } as CustomSongInfo;
  });
  return out;
};

// Parts song ----------------------------------------------------------------

/**
 * Checks if a part with the same name already exists in the database
 * @returns True if the part already exists, false otherwise
 */
export const checkNamePartSongToDatabase = async (
  namePart: string,
  songId: string
): Promise<boolean> => {
  const col = collection(
    firestore,
    CUSTOM_SONGS_COLLECTION,
    songId,
    PARTS_SONGS_COLLECTION
  );
  const q = query(col, where('name', '==', namePart));
  const refDocs = await getDocs(q);
  return refDocs.docs.length !== 0;
};

export const addPartSongToDatabase = async (
  userId: string,
  authorName: string,
  songId: string,
  namePart: string
): Promise<string> => {
  const newPartDocRef = await addDoc(
    collection(
      firestore,
      CUSTOM_SONGS_COLLECTION,
      songId,
      PARTS_SONGS_COLLECTION
    ),
    {
      creationTime: Timestamp.now(),
      lastModified: Timestamp.now(),
      author: authorName,
      userId: userId,
      state: 'pending',
      name: namePart
    } as PartSongInfo
  );
  await updateDoc(doc(firestore, USERS_COLLECTION, userId), {
    ownedParts: arrayUnion(newPartDocRef.path),
    counter_pending_parts: increment(1)
  });
  return newPartDocRef.id;
};

export const deletePartSongFromDatabase = async (
  userId: string,
  songId: string,
  idDoc: string
): Promise<void> => {
  const docRef = doc(
    firestore,
    CUSTOM_SONGS_COLLECTION,
    songId,
    PARTS_SONGS_COLLECTION,
    idDoc
  );
  const song = await getInfoPartSong(songId, idDoc);
  await deleteDoc(docRef);
  await updateDoc(doc(firestore, USERS_COLLECTION, userId), {
    ownedParts: arrayRemove(docRef.path),
    counter_pending_parts: increment(song.state === 'pending' ? -1 : 0)
  });
  await deletePartSongFromServerStorage(idDoc, songId);
};

export const getInfoPartSong = async (
  songId: string,
  idPart: string
): Promise<PartSongInfo> => {
  const docSong = doc(
    firestore,
    CUSTOM_SONGS_COLLECTION,
    songId,
    PARTS_SONGS_COLLECTION,
    idPart
  );
  const refDoc = await getDoc(docSong);
  const out = { ...refDoc.data(), idPart: refDoc.id } as PartSongInfo;
  return out;
};

export const editPartSongToDatabase = async (
  songId: string,
  idPart: string
): Promise<void> => {
  await updateDoc(
    doc(
      firestore,
      CUSTOM_SONGS_COLLECTION,
      songId,
      PARTS_SONGS_COLLECTION,
      idPart
    ),
    {
      lastModified: Timestamp.now()
    }
  );
};

export interface PartSongInfo {
  name: string;
  idPart: string /* In firebase case the ID of the document */;
  creationTime: Timestamp;
  lastModified: Timestamp;
  /** The *display name* typed by the uploader, not an id. Renaming the field
   * would need a migration of the existing documents. */
  author: string;
  /** The uid of who uploaded the part. */
  userId: string;
  rates?: number;
  state: 'approved' | 'pending';
}

export const getSongInfoParts = async (
  userId: string,
  songId: string
): Promise<PartSongInfo[]> => {
  const customSongCollections = collection(
    firestore,
    CUSTOM_SONGS_COLLECTION,
    songId,
    PARTS_SONGS_COLLECTION
  );
  const q = query(
    customSongCollections,
    or(where('author', '==', userId), where('state', '==', 'approved'))
  );
  const refDocs = await getDocs(q);
  return refDocs.docs.map((doc) => {
    return { ...doc.data(), idPart: doc.id } as PartSongInfo;
  });
};
