import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const provider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, provider);
  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
