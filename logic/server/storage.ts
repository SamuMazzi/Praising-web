import app from './firebase_config';
import {
  getStorage,
  ref,
  uploadString,
  getBlob,
  deleteObject,
  type StorageReference
} from 'firebase/storage';

const storage = getStorage(app);

const CUSTOM_SONGS_FOLDER = 'songs';

const getRefEditedSong = (
  songId: string,
  idVersion: string
): StorageReference =>
  ref(storage, `${CUSTOM_SONGS_FOLDER}/${songId}/${idVersion}.crd`);

export const addModifiedSongToServerStorage = async (
  idVersion: string,
  contentFile: string,
  songId: string
): Promise<void> => {
  const pathReference = getRefEditedSong(songId, idVersion);
  await uploadString(pathReference, contentFile);
};

export const deleteModifiedSongFromServerStorage = async (
  idVersion: string,
  songId: string
): Promise<void> => {
  const pathReference = getRefEditedSong(songId, idVersion);
  await deleteObject(pathReference);
};

export const getVersionSong = async (
  idVersion: string,
  songId: string
): Promise<string> => {
  const pathReference = getRefEditedSong(songId, idVersion);
  const content = await getBlob(pathReference);
  return await content.text();
};
