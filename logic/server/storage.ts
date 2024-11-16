import app from './firebase_config';
import {
  getStorage,
  ref,
  uploadString,
  getBlob,
  deleteObject,
  getDownloadURL,
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

const getRefPartSong = (songId: string, idPart: string): StorageReference =>
  ref(storage, `${CUSTOM_SONGS_FOLDER}/${songId}/parts/${idPart}.mp3`);

export const addPartSongToServerStorage = async (
  idPart: string,
  contentFile: string,
  type: string,
  songId: string
): Promise<void> => {
  const pathReference = getRefPartSong(songId, idPart);
  await uploadString(pathReference, contentFile, 'base64', {
    contentType: type
  });
};

export const deletePartSongFromServerStorage = async (
  idPart: string,
  songId: string
): Promise<void> => {
  const pathReference = getRefPartSong(songId, idPart);
  await deleteObject(pathReference);
};

export const getPartSong = async (
  idPart: string,
  songId: string
): Promise<string> => {
  const pathReference = getRefPartSong(songId, idPart);
  return await getDownloadURL(pathReference);
  const content = await getBlob(pathReference);
  return await content.text();
};
