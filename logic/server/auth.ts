import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
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
import { type UserDatabase } from './database';

/** Firestore pesa ~280 kB e serve solo nei flussi di accesso/collegamento
 *  account: lo carichiamo al momento, non in ogni pagina. */
const database = async () => await import('./database');

/**
 * `getAuth()` include di default il popup/redirect resolver: e' l'iframe
 * ospitato su `<authDomain>/__/auth/iframe.js` piu' `gapi` (~127 kB di
 * script di terze parti) che veniva caricato su *ogni* pagina, anche se il
 * login avviene solo in /login. Inizializzando qui senza resolver, l'iframe
 * viene caricato solo dove serve: i due punti che aprono un popup lo passano
 * esplicitamente (vedi `browserPopupRedirectResolver` piu' sotto).
 *
 * Durante il prerender non c'e' browser: niente persistenza, tanto lato
 * server l'istanza non viene mai usata.
 */
export const auth =
  typeof window === 'undefined'
    ? initializeAuth(app)
    : initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence]
      });
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
    const serverInfo = await (await database()).getUserFromDatabase(user.uid);
    if (serverInfo === undefined) {
      // User didn't exists yet, so we signed up actually
      await (await database()).addUserToDatabase(user.uid, oldInfoUser ?? {});
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
      oldInfoUser = await (await database()).getUserFromDatabase(oldIdUser);
    }
    let result: UserCredential;
    if (sessionStorage.getItem('pendingGoogleSign')) {
      result = await signInWithPopup(
        auth,
        provider,
        browserPopupRedirectResolver
      );
      sessionStorage.removeItem('pendingGoogleSign');
    } else {
      result = await linkWithPopup(
        authUser,
        provider,
        browserPopupRedirectResolver
      );
    }
    await afterSignGoogle(result, oldInfoUser ?? undefined);
    /**
     * Stesso inganno di `signInWithEmail`: `linkWithPopup` conserva l'uid
     * dell'anonimo, quindi `oldIdUser` e' il documento che `afterSignGoogle`
     * ha appena creato. Solo il ramo `signInWithPopup` cambia davvero uid, ed
     * e' li' che il vecchio documento va cancellato.
     */
    if (oldIdUser !== null && oldIdUser !== auth.currentUser?.uid) {
      // We delete the old user
      await (await database()).deleteUserFromDatabase(oldIdUser);
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
      const oldInfoUser = await (
        await database()
      ).getUserFromDatabase(oldIdUser);
      const emailUserCredential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(authUser, emailUserCredential);
      await (
        await database()
      ).addUserToDatabase(authUser.uid, oldInfoUser ?? {});
    } else if (type === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
      // Chi si e' registrato quando la cancellazione qui sotto era
      // incondizionata (vedi commento) e' rimasto senza profilo: lo
      // ricreiamo al primo accesso, altrimenti preferiti, playlist e avvisi
      // non hanno dove appoggiarsi.
      const newId = auth.currentUser?.uid;
      if (newId !== undefined) {
        const serverInfo = await (await database()).getUserFromDatabase(newId);
        if (serverInfo === undefined) {
          await (await database()).addUserToDatabase(newId, {});
        }
      }
    }
    /**
     * Solo se l'accesso ha davvero cambiato uid, cioe' nel caso 'login'.
     * In 'signup' `linkWithCredential` conserva l'uid dell'anonimo, quindi
     * `oldIdUser` e' lo stesso documento appena creato qui sopra: cancellarlo
     * senza questo controllo lasciava ogni nuovo iscritto senza profilo.
     */
    if (oldIdUser !== auth.currentUser?.uid) {
      await (await database()).deleteUserFromDatabase(oldIdUser);
    }
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
