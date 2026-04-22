'use client';
// lib/auth-context.js
import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

async function fetchRole(uid) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        return { role: (data.role || 'student').trim().toLowerCase(), data };
      }
    } catch {
      await new Promise(r => setTimeout(r, 600));
    }
  }
  return { role: 'student', data: {} };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { role: r, data } = await fetchRole(firebaseUser.uid);
        setRole(r);
        setUser({ ...firebaseUser, ...data, uid: firebaseUser.uid });
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login    = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout   = async () => { setUser(null); setRole(null); await signOut(auth); };
  const resetPwd = (email) => sendPasswordResetEmail(auth, email);

  const register = async (email, password, name, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid, name, email, phone,
      role: 'student', status: 'active',
      applicationStatus: 'pending',
      enrolledCourses: [], documents: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return cred;
  };

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      isAdmin:   role === 'admin' || role === 'staff',
      isStudent: role === 'student',
      login, logout, register, resetPwd,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
