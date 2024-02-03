import { useContext, createContext } from "react";
import { User } from "firebase/auth";
import useFirebaseAuth from "../hooks/use_auth";

interface AuthContextProps {
    user: User | null;

}

export const AuthContext = createContext<AuthContextProps>({
    user: null
});

export const AuthContextProvider = (propsWithChildren: any) => {
  const {authUser, loading} = useFirebaseAuth();  

  return (
    <AuthContext.Provider value={{ user: authUser }}>
      {propsWithChildren.children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
