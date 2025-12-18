'use client';

import { createContext } from 'react';
import { User } from 'firebase/auth';
import useFirebaseAuth from '../hooks/use_auth';

interface AuthContextProps {
  user: User | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null
});

export const AuthContextProvider = (propsWithChildren: {
  children: React.ReactNode;
}) => {
  const { authUser } = useFirebaseAuth();

  return (
    <AuthContext.Provider value={{ user: authUser }}>
      {propsWithChildren.children}
    </AuthContext.Provider>
  );
};

/* export const UserAuth = () => {
  return useContext(AuthContext);
}; */
