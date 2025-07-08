
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db, messaging } from '@/lib/firebase';
import { createUserProfileIfNotExists, addFcmTokenToUser, type User as AppUser } from '@/lib/users';
import { usePathname, useRouter } from 'next/navigation';
import { isPublicPath, isAuthPath } from '@/lib/paths';
import { getMessaging, getToken } from 'firebase/messaging';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  unreadNotificationCount: number;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  unreadNotificationCount: 0,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (fbUser) => {
      let userSnapshotUnsubscribe: () => void = () => {};
      let notificationUnsubscribe: () => void = () => {};
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);
        
        userSnapshotUnsubscribe = onSnapshot(userDocRef, async (doc) => {
            if (doc.exists()) {
                setUser({ ...doc.data(), email: fbUser.email } as AppUser);
            } else {
                try {
                    await createUserProfileIfNotExists(fbUser);
                } catch (creationError) {
                    //
                }
            }
            setLoading(false);
        }, (error) => {
            setUser(null);
            setLoading(false);
        });

        const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', fbUser.uid));
        notificationUnsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const count = snapshot.docs.filter(doc => !doc.data().read && doc.data().type !== 'contact_form_submission').length;
            setUnreadNotificationCount(count);
        });

      } else {
        setFirebaseUser(null);
        setUser(null);
        setUnreadNotificationCount(0);
        setLoading(false);
      }
      
      return () => {
        userSnapshotUnsubscribe();
        notificationUnsubscribe();
      };
    });

    return () => authUnsubscribe();
  }, []);
  
  useEffect(() => {
    if (loading) return;

    const onAuthPage = isAuthPath(pathname);
    const publicPath = isPublicPath(pathname);

    if (!user && !publicPath) {
      router.push('/auth/sign-in');
    } 
    else if (user && onAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, unreadNotificationCount }}>
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
