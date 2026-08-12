import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, db, isFirebaseConfigured, ADMIN_EMAIL, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  demoLogin: (asAdmin?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'foodmart_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state to local storage
  const saveUserToState = (profile: UserProfile | null) => {
    setUser(profile);
    if (profile) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  };

  // Helper to determine role
  const determineRole = (email: string, requestedRole?: UserRole): UserRole => {
    if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
      return 'admin';
    }
    return requestedRole || 'customer';
  };

  // Save profile to Firestore if configured
  const persistProfileToFirestore = async (profile: UserProfile) => {
    if (isFirebaseConfigured() && db) {
      try {
        const userRef = doc(db, 'users', profile.userId);
        await setDoc(userRef, profile, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${profile.userId}`);
      }
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const role = determineRole(fbUser.email || '');
          let profile: UserProfile = {
            userId: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || undefined,
            role,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };

          if (db) {
            try {
              const userRef = doc(db, 'users', fbUser.uid);
              const docSnap = await getDoc(userRef);
              if (docSnap.exists()) {
                const existingData = docSnap.data() as UserProfile;
                profile = {
                  ...existingData,
                  role, // Always ensure correct role for admin email
                  lastLoginAt: new Date().toISOString()
                };
                await updateDoc(userRef, { lastLoginAt: profile.lastLoginAt, role });
              } else {
                await setDoc(userRef, profile);
              }
            } catch (e) {
              console.warn('Firestore user fetch failed, using memory auth state:', e);
            }
          }
          saveUserToState(profile);
        } else {
          // Keep existing local demo user if non-firebase login was used, or clear if signed out
          const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (!saved) {
            saveUserToState(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    const role = determineRole(email);
    
    if (isFirebaseConfigured() && auth && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
      } catch (err) {
        console.warn('Firebase login failed, trying fallback demo login:', err);
      }
    }

    // Demo/Local login fallback
    const mockProfile: UserProfile = {
      userId: `user-${Date.now()}`,
      name: email.toLowerCase().includes('admin') ? 'FOOD MART Owner' : email.split('@')[0],
      email: email.trim(),
      role,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await persistProfileToFirestore(mockProfile);
    saveUserToState(mockProfile);
    setLoading(false);
    return true;
  };

  const signup = async (name: string, email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    const role = determineRole(email);

    if (isFirebaseConfigured() && auth && password) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          userId: cred.user.uid,
          name: name.trim(),
          email: email.trim(),
          role,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await persistProfileToFirestore(profile);
        saveUserToState(profile);
        setLoading(false);
        return true;
      } catch (err) {
        console.warn('Firebase signup error, proceeding with local profile:', err);
      }
    }

    const mockProfile: UserProfile = {
      userId: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await persistProfileToFirestore(mockProfile);
    saveUserToState(mockProfile);
    setLoading(false);
    return true;
  };

  const demoLogin = async (asAdmin: boolean = false): Promise<boolean> => {
    const email = asAdmin ? ADMIN_EMAIL : 'demo@foodmart.com';
    const name = asAdmin ? 'FOOD MART Owner' : 'Janger Customer';
    return await signup(name, email);
  };

  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error('Signout error:', e);
      }
    }
    saveUserToState(null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUserToState(updated);
    await persistProfileToFirestore(updated);
  };

  const isAdmin = user?.role === 'admin' || user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        signup,
        demoLogin,
        logout,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
