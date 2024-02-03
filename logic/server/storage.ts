import app from "./firebase_config";
import { getStorage, ref, getDownloadURL, uploadString } from "firebase/storage";

const storage = getStorage(app)

export const addModifiedSong = async (name_file: string, content_file: string, user_id: string) => {
    const pathReference = ref(storage, user_id + '/' + name_file);
    await uploadString(pathReference, content_file)
}

export const getModifiedSong = async (name_file: string, user_id: string) => {
    const pathReference = ref(storage, user_id + '/' + name_file);
    const contentFile = await getDownloadURL(pathReference)
    return contentFile
}
