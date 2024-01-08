import { useState, useEffect } from 'react'
import app from '../server/firebase_config';
import { User, getAuth, signInAnonymously } from 'firebase/auth';

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
  const auth = getAuth(app);

  const authStateChanged = async (authState: User | null) => {
    setAuthUser(authState)
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true)
    auth.authStateReady().then(async () => {
        if(auth.currentUser === null) {
            const credentials = await signInAnonymously(auth)
            setAuthUser(credentials.user)
        } else {
            setAuthUser(auth.currentUser)
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