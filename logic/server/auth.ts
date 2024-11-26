import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  linkWithPopup,
  linkWithCredential,
  User
} from 'firebase/auth';
import app from './firebase_config';
import {
  addUserToDatabase,
  deleteUserFromDatabase,
  getUserFromDatabase
} from './database';

export const auth = getAuth(app);
auth.languageCode = 'it';

export class SignError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, SignError.prototype);
  }
}

export const signInWithGoogle = async (authUser: User) => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  // try {
  const oldIdUser = authUser.uid;
  const oldInfoUser = await getUserFromDatabase(oldIdUser);
  const result = await linkWithPopup(authUser, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential === null) throw new Error('Credential is null');
  const user = result.user;
  const serverInfo = await getUserFromDatabase(user.uid);
  if (serverInfo === undefined) {
    // User didn't exists yet, so we signed up actually
    await addUserToDatabase(user.uid, oldInfoUser ?? {});
  } // Otherwise we don't need to do anything

  // We delete the old user
  await deleteUserFromDatabase(oldIdUser);
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

/**
 * - signup -> colleghi account anonimo al nuovo e sposti tutto
 * - signup (già fatto con altra mail) -> si dovrebbe lamentare che non puoi linkare questo account due volte (quindi alert per utente)
 */

export const signInWithEmail = async (
  type: 'signup' | 'login',
  authUser: User,
  email: string,
  password: string
) => {
  try {
    const oldIdUser = authUser.uid;
    if (type === 'signup') {
      const oldInfoUser = await getUserFromDatabase(oldIdUser);
      const emailUserCredential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(authUser, emailUserCredential);
      await addUserToDatabase(authUser.uid, oldInfoUser ?? {});
    } else if (type === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
    }
    await deleteUserFromDatabase(oldIdUser);
  } catch (error: any) {
    let message = error.message as string;
    if (error.code === 'auth/provider-already-linked') {
      throw new SignError('Questo account è già collegato ad un altro account');
    }
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
