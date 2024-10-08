import { useState, useEffect } from 'react';
import { User, signInAnonymously } from 'firebase/auth';
import { auth } from '../server/auth';
import { getServerProfile } from '../server/database';
import { getFromStorage, saveToStorage } from '../local_logic';
import { UserProfileServerKey } from '../redux/user_info_slice';

export interface AuthUser {
  uid: string;
  email: string;
}

export const formatAuthUser = (user: User) => ({
  uid: user.uid,
  email: user.email
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const authStateChanged = async (authState: User | null) => {
    setAuthUser(authState);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    auth.authStateReady().then(async () => {
      if (auth.currentUser === null) {
        const credentials = await signInAnonymously(auth);
        setAuthUser(credentials.user);
        saveToStorage(
          UserProfileServerKey,
          {
            anonymous: credentials.user.isAnonymous,
            uid: credentials.user.uid,
            email: credentials.user.email
          },
          'sessionStorage'
        );
      } else {
        setAuthUser(auth.currentUser);
        const sessionProfile = getFromStorage(
          UserProfileServerKey,
          'sessionStorage'
        );
        if (
          (sessionProfile === null ||
            sessionProfile.uid !== auth.currentUser) &&
          !auth.currentUser.isAnonymous
        ) {
          /** Fetch from firebase */
          const infoProfile = await getServerProfile(auth.currentUser.uid);
          saveToStorage(
            UserProfileServerKey,
            {
              ...infoProfile,
              uid: auth.currentUser.uid,
              anonymous: auth.currentUser.isAnonymous,
              email: auth.currentUser.email
            },
            'sessionStorage'
          );
        }
      }
    });
    const unsubscribe = auth.onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading
  };
}
