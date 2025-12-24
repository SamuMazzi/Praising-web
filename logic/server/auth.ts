import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  linkWithPopup,
  linkWithCredential,
  signInWithPopup,
  User,
  UserCredential
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import app from './firebase_config';
import {
  addUserToDatabase,
  deleteUserFromDatabase,
  getUserFromDatabase,
  UserDatabase
} from './database';

export const auth = getAuth(app);
auth.languageCode = 'it';

export class SignError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, SignError.prototype);
  }
}

export const afterSignGoogle = async (
  result: UserCredential,
  oldInfoUser?: UserDatabase,
  checkIfExists: boolean = true
) => {
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential === null) throw new Error('Credential is null');
  if (checkIfExists === true) {
    const user = result.user;
    const serverInfo = await getUserFromDatabase(user.uid);
    if (serverInfo === undefined) {
      // User didn't exists yet, so we signed up actually
      await addUserToDatabase(user.uid, oldInfoUser ?? {});
    } // Otherwise we don't need to do anything
  }
  return credential;
};

export const signInWithGoogle = async (authUser: User) => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  let oldIdUser = null;
  let oldInfoUser = undefined;
  try {
    if (authUser.isAnonymous) {
      oldIdUser = authUser.uid;
      oldInfoUser = await getUserFromDatabase(oldIdUser);
    }
    let result: UserCredential;
    if (sessionStorage.getItem('pendingGoogleSign')) {
      result = await signInWithPopup(auth, provider);
      sessionStorage.removeItem('pendingGoogleSign');
    } else {
      result = await linkWithPopup(authUser, provider);
    }
    await afterSignGoogle(result, oldInfoUser ?? undefined);
    if (oldIdUser !== null) {
      // We delete the old user
      await deleteUserFromDatabase(oldIdUser);
    }
    return result;
  } catch (error) {
    // Handle Errors here.
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/credential-already-in-use') {
        // 🔴 FALLBACK: REDIRECT
        sessionStorage.setItem('pendingGoogleSign', 'true');
        throw new SignError(
          'Questo account è già collegato ad un altro account. Clicca di nuovo su "Accedi con Google".'
        );
      } else if (error.code === 'auth/popup-closed-by-user') {
        return;
      } else {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // // The email of the user's account used.
        // const email = error.customData?.email;
        // // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
        throw new SignError(error.message);
      }
    } else throw error;
  }
};

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
  } catch (error) {
    if (!(error instanceof FirebaseError)) {
      throw error;
    }
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
