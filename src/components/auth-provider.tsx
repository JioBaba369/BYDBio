
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as AppUser } from '@/lib/users';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

// The public-facing pages that don't require authentication.
const PUBLIC_PATHS = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/reset-password',
    '/u/',
    '/b/',
    '/l/',
    '/o/',
    '/offer/',
    '/events/'
];

const isPublicPath = (path: string) => {
    if (path === '/') return false; // Dashboard is protected
    return PUBLIC_PATHS.some(p => path.startsWith(p));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (fbUser) => {
      let snapshotUnsubscribe: () => void = () => {};
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);
        
        snapshotUnsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUser({ ...doc.data(), email: fbUser.email } as AppUser);
            } else {
                console.error("No user profile found in Firestore for UID:", fbUser.uid);
                setUser(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setLoading(false);
        });

      } else {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
      }
      
      return () => {
        snapshotUnsubscribe();
      };
    });

    return () => authUnsubscribe();
  }, []);
  
  useEffect(() => {
    if (loading) return;

    const onAuthPage = pathname.startsWith('/auth');
    const publicPath = isPublicPath(pathname);

    // If user is not logged in AND path is not public, redirect to sign-in
    if (!user && !publicPath) {
      router.push('/auth/sign-in');
    } 
    // If user IS logged in AND on an auth page, redirect to dashboard
    else if (user && onAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
