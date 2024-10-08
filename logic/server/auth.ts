import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import app from './firebase_config';
import { addUserToDatabase, getUserFromDatabase } from './database';
import { type DocumentData } from 'firebase/firestore';

export const auth = getAuth(app);
auth.languageCode = 'it';

export class SignError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, SignError.prototype);
  }
}

export const signInWithGoogle = async (): Promise<DocumentData | undefined> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile	');
  // try {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential === null) throw new Error('Credential is null');
  const user = result.user;
  const serverInfo = await getUserFromDatabase(user.uid);
  if (serverInfo !== undefined) {
    await addUserToDatabase(user.uid);
  }
  return serverInfo;
  /* } catch (error: any) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    throw error;
  } */
};

export const signInWithEmail = async (
  type: 'signup' | 'login',
  email: string,
  password: string
): Promise<DocumentData | undefined> => {
  try {
    let userInfo;
    if (type === 'signup') {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await addUserToDatabase(userCredential.user.uid);
      userInfo = { favoriteSongs: [] };
    } else if (type === 'login') {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userInfoServer = await getUserFromDatabase(userCredential.user.uid);
      userInfo = userInfoServer;
    }
    return userInfo;
  } catch (error: any) {
    let message = error.message as string;
    if (
      error.code === 'auth/argument-error' ||
      error.code === 'auth/invalid-email'
    ) {
      message = 'Inserisci una email valida';
    } else if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/email-already-in-use' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      message = 'Credenziali non valide';
    }
    console.log(error);
    throw new SignError(message);
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};
