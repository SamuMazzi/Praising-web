import app from './firebase_config';
import { getStorage, ref, uploadString, getBlob } from 'firebase/storage';

const storage = getStorage(app);

const CUSTOM_SONGS_FOLDER = 'songs';

export const addModifiedSongToServerStorage = async (
  nameFile: string,
  contentFile: string,
  songId: string
): Promise<void> => {
  const pathReference = ref(
    storage,
    `${CUSTOM_SONGS_FOLDER}/${songId}/${nameFile}`
  );
  await uploadString(pathReference, contentFile);
};

export const getVersionSong = async (
  nameFile: string,
  songId: string
): Promise<string> => {
  const pathReference = ref(
    storage,
    `${CUSTOM_SONGS_FOLDER}/${songId}/${nameFile}`
  );
  const content = await getBlob(pathReference);
  return await content.text();
};
