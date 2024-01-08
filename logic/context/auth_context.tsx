import { useContext, createContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  getAuth,
  User,
} from "firebase/auth";
import app from "../server/firebase_config";

const auth = getAuth(app);

export const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
};

export const logOut = () => {
    signOut(auth);
};

interface AuthContextProps {
    user: User | null;

}

const AuthContext = createContext<AuthContextProps>({
    user: null
});

export const AuthContextProvider = (propsWithChildren: any) => {
  const [user, setUser] = useState<User | null>(null);  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user: user }}>
      {propsWithChildren.children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};