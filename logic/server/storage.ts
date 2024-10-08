import app from './firebase_config';
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadString
} from 'firebase/storage';

const storage = getStorage(app);

export const addModifiedSong = async (
  nameFile: string,
  contentFile: string,
  userId: string
): Promise<void> => {
  const pathReference = ref(storage, userId + '/' + nameFile);
  await uploadString(pathReference, contentFile);
};

export const getModifiedSong = async (
  nameFile: string,
  userId: string
): Promise<string> => {
  const pathReference = ref(storage, userId + '/' + nameFile);
  const contentFile = await getDownloadURL(pathReference);
  return contentFile;
};
