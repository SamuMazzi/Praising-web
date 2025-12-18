'use client';

import { useState, useEffect } from 'react';
import { type User, signInAnonymously } from 'firebase/auth';
import { auth } from '../server/auth';
import {
  addUserToDatabase,
  getUserFromDatabase,
  UserDatabase
} from '../server/database';
import { getFromStorage, saveToStorage } from '../local_logic';
import fbApp from '../server/firebase_config';
import { getAnalytics, setUserId } from 'firebase/analytics';

const LastTimeFetchedUserKey = 'last_time_fetched_user_profile';

export interface AuthUser {
  uid: string;
  email: string;
}

export default function useFirebaseAuth(): {
  authUser: User | null;
  infoProfile: UserDatabase | undefined;
  loading: boolean;
} {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [infoProfile, setInfoProfile] = useState<UserDatabase | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const authStateChanged = (authState: User | null): void => {
    setAuthUser(authState);
    // As of now, we can't have authState as null, so if we receive it, it means that it's still loading
    if (authState !== null) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  const onAuthStateReady = async (): Promise<void> => {
    if (auth.currentUser === null) {
      const credentials = await signInAnonymously(auth);
      const infoUser = await addUserToDatabase(credentials.user.uid, {});
      setInfoProfile(infoUser);
      setAuthUser(credentials.user);
      saveToStorage(LastTimeFetchedUserKey, Date.now(), 'sessionStorage');
    } else {
      setAuthUser(auth.currentUser);
      const lastTimeFetched = getFromStorage(
        LastTimeFetchedUserKey,
        'sessionStorage'
      );
      // If user data already been fetched in 1 hour, don't fetch again
      if (
        (lastTimeFetched === null ||
          (Date.now() - lastTimeFetched) / (1000 * 60 * 60)) &&
        !auth.currentUser.isAnonymous
      ) {
        /** Fetch from firebase */
        const infoProfileDoc = await getUserFromDatabase(auth.currentUser.uid);
        // console.log('infoProfileDoc', infoProfileDoc);
        saveToStorage(LastTimeFetchedUserKey, Date.now(), 'sessionStorage');
        setInfoProfile(infoProfileDoc);
      }
    }
    setUserId(getAnalytics(fbApp), auth.currentUser?.uid ?? null);
  };

  useEffect(() => {
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
    loading
  };
}
