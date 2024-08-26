import { Playlist } from "../redux/playlist_slice";
import app from "./firebase_config";
import { getFirestore, collection, addDoc, getDoc, doc, getDocs, query, orderBy, startAt, endAt, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
// import geofire from 'geofire-common';

const firestore = getFirestore(app)

interface OnlinePlaylist {
    name: string
    songs: string[]
    notes?: string
    owner: string
}

// TODO: When you share it you want to decide if copying it or just accessing it. In the first case another playlist will be created 
// but it will be personal, in the second case the playlist will be kept in sync with the original but it won't be editable

export const addPlaylist = async (name: string, songs: string[]) => {
    const onlinePlaylist: OnlinePlaylist = {
        name: name,
        songs: songs,
        owner: "" //TODO: Add personal id
    }
    const docRef = await addDoc(collection(firestore, "playlists"), onlinePlaylist)
    const out: Playlist = {
        id: docRef.id,
        name: name,
        songs: songs
    }
    return out
}

export const getMyPlaylists = async (name: string, songs: string[]) => {
    //TODO: Add personal id and implement everything
    const docRef = await getDoc(doc(firestore, "users", "id"))
    const out: Playlist = {
        id: docRef.id,
        name: name,
        songs: songs
    }
    return out
}

/**
 * Get all the playlists that have been shared with me 
 */
export const getPersonalPlaylists = async (name: string, songs: string[]) => {
    const onlinePlaylist: OnlinePlaylist = {
        name: name,
        songs: songs,
        owner: "" //TODO: Add personal id
    }
    const docRef = await getDoc(doc(firestore, "users", "persona-id"))
    const out: Playlist = {
        id: docRef.id,
        name: name,
        songs: songs
    }
    return out
}

export const getSinglePlaylist = async (id_playlist: string) => {
    const docRef = await getDoc(doc(firestore, "playlists", id_playlist))
    const out: Playlist = {
        id: docRef.id,
        name: docRef.get("name"),
        songs: docRef.get("songs")
    }
    return out
}


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

export const getServerProfile = async (user_id: string) => {
    const docRef = await getDoc(doc(firestore, "users", user_id))
    return docRef.data()
}

export const addServerFavoriteSongs = async (user_id: string, new_song: string) => {
    await updateDoc(doc(firestore, "users", user_id), {'favoriteSongs': arrayUnion(new_song)})
}

export const removeServerFavoriteSongs = async (user_id: string, new_song: string) => {
    await updateDoc(doc(firestore, "users", user_id), {'favoriteSongs': arrayRemove(new_song)})

}

export const addUserToDatabase = async (user_id: string) => {
    await setDoc(doc(firestore, "users", user_id), {})
}

export const getUserFromDatabase = async (user_id: string) => {
    const docRef = await getDoc(doc(firestore, "users", user_id))
    return docRef.data();
}
