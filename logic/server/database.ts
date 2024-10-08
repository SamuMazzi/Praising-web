import { type Playlist } from '../redux/playlist_slice';
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
  type DocumentData
} from 'firebase/firestore';
// import geofire from 'geofire-common';

const firestore = getFirestore(app);
const USERS_COLLECTION = 'users';

interface OnlinePlaylist {
  name: string;
  songs: string[];
  notes?: string;
  owner: string;
}

// TODO: When you share it you want to decide if copying it or just accessing it. In the first case another playlist will be created
// but it will be personal, in the second case the playlist will be kept in sync with the original but it won't be editable

export const addPlaylist = async (
  name: string,
  songs: string[]
): Promise<Playlist> => {
  const onlinePlaylist: OnlinePlaylist = {
    name,
    songs,
    owner: '' // TODO: Add personal id
  };
  const docRef = await addDoc(
    collection(firestore, 'playlists'),
    onlinePlaylist
  );
  const out: Playlist = {
    id: docRef.id,
    name,
    songs
  };
  return out;
};

export const getMyPlaylists = async (
  name: string,
  songs: string[]
): Promise<Playlist> => {
  // TODO: Add personal id and implement everything
  const docRef = await getDoc(doc(firestore, USERS_COLLECTION, 'id'));
  const out: Playlist = {
    id: docRef.id,
    name,
    songs
  };
  return out;
};

/**
 * Get all the playlists that have been shared with me
 */
export const getPersonalPlaylists = async (
  name: string,
  songs: string[]
): Promise<Playlist> => {
  const docRef = await getDoc(doc(firestore, USERS_COLLECTION, 'persona-id'));
  const out: Playlist = {
    id: docRef.id,
    name,
    songs
  };
  return out;
};

export const getSinglePlaylist = async (
  idPlaylist: string
): Promise<Playlist> => {
  const docRef = await getDoc(doc(firestore, 'playlists', idPlaylist));
  const out: Playlist = {
    id: docRef.id,
    name: docRef.get('name'),
    songs: docRef.get('songs')
  };
  return out;
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

export const getServerProfile = async (
  userId: string
): Promise<DocumentData | undefined> => {
  const docRef = await getDoc(doc(firestore, USERS_COLLECTION, userId));
  return docRef.data();
};

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

export const addUserToDatabase = async (userId: string): Promise<void> => {
  await setDoc(doc(firestore, USERS_COLLECTION, userId), {});
};

export const getUserFromDatabase = async (
  userId: string
): Promise<DocumentData | undefined> => {
  const docRef = await getDoc(doc(firestore, USERS_COLLECTION, userId));
  return docRef.data();
};
