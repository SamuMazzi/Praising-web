'use client';

import { useState, useEffect } from 'react';
import { type User, signInAnonymously } from 'firebase/auth';
import { auth } from '../server/auth';
import { type UserDatabase } from '../server/database';

/** Vedi auth.ts: Firestore entra in gioco solo quando c'e' davvero un profilo
 *  da leggere o creare. */
const database = async () => await import('../server/database');
import { getFromStorage, saveToStorage } from '../local_logic';
import fbApp from '../server/firebase_config';

const LastTimeFetchedUserKey = 'last_time_fetched_user_profile';

export interface AuthUser {
  uid: string;
  email: string;
}

export default function useFirebaseAuth(): {
  authUser: User | null;
  infoProfile: UserDatabase | undefined;
  loading: boolean;
  logout: () => Promise<void>;
} {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [infoProfile, setInfoProfile] = useState<UserDatabase | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const createAnonymousUser = async (): Promise<void> => {
    const credentials = await signInAnonymously(auth);
    const infoUser = await (
      await database()
    ).addUserToDatabase(credentials.user.uid, {});
    setInfoProfile(infoUser);
    setAuthUser(credentials.user);
    saveToStorage(LastTimeFetchedUserKey, Date.now(), 'sessionStorage');
  };

  const authStateChanged = (authState: User | null): void => {
    setAuthUser(authState);
    // As of now, we can't have authState as null, so if we receive it, it means that it's still loading
    if (authState !== null) {
      setLoading(false);
    } else {
      setLoading(true);
      createAnonymousUser().finally(() => {
        setLoading(false);
      });
    }
  };

  const onAuthStateReady = async (): Promise<void> => {
    if (auth.currentUser === null) {
      await createAnonymousUser();
    } else {
      setAuthUser(auth.currentUser);
      const lastTimeFetched = getFromStorage(
        LastTimeFetchedUserKey,
        'sessionStorage'
      ) as number | null;
      // If user data already been fetched in 1 hour, don't fetch again
      if (
        (lastTimeFetched === null ||
          (Date.now() - lastTimeFetched) / (1000 * 60 * 60)) &&
        !auth.currentUser.isAnonymous
      ) {
        /** Fetch from firebase */
        const infoProfileDoc = await (
          await database()
        ).getUserFromDatabase(auth.currentUser.uid);
        // console.log('infoProfileDoc', infoProfileDoc);
        saveToStorage(LastTimeFetchedUserKey, Date.now(), 'sessionStorage');
        setInfoProfile(infoProfileDoc);
      }
    }
    const { getAnalytics, setUserId } = await import('firebase/analytics');
    setUserId(getAnalytics(fbApp), auth.currentUser?.uid ?? null);
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
    setInfoProfile(undefined);
    setAuthUser(null);
    //TODO: Test better this one
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    void auth.authStateReady().then(() => {
      void onAuthStateReady();
    });
    const unsubscribe = auth.onAuthStateChanged(authStateChanged);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    authUser,
    infoProfile,
    loading,
    logout
  };
}
