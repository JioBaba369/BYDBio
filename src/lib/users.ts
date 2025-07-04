
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

export type BusinessCard = {
  title: string;
  company: string;
  phone?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  location?: string;
};

export type UserLink = {
    icon: string;
    title: string;
    url: string;
}

export type User = {
  id: string; // Document ID (same as uid)
  uid: string; // Firebase Auth UID
  name: string;
  handle: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  avatarFallback: string;
  bio: string;
  following: string[]; // Array of user IDs this user follows
  subscribers: number;
  links: UserLink[];
  businessCard?: BusinessCard;
};

/**
 * Creates a user profile in Firestore if one doesn't already exist.
 * This prevents overwriting data on subsequent logins.
 * @param user The user object from Firebase Authentication.
 * @param additionalData Additional data to include in the profile, like the name from the sign-up form.
 */
export const createUserProfileIfNotExists = async (user: FirebaseUser, additionalData?: { name?: string }) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const username = user.email?.split('@')[0] || `user${user.uid.substring(0,5)}`;
        // In a real app, you might want to check if this username is unique and handle collisions.
        await setDoc(userDocRef, {
            uid: user.uid,
            id: user.uid,
            email: user.email,
            name: additionalData?.name || user.displayName || "New User",
            username: username,
            handle: username,
            avatarUrl: user.photoURL || `https://placehold.co/200x200.png`,
            avatarFallback: (additionalData?.name || user.displayName)?.charAt(0).toUpperCase() || 'U',
            bio: "",
            following: [],
            subscribers: 0,
            links: [],
            businessCard: {},
        });
    }
};

/**
 * Updates a user's profile document in Firestore.
 * @param uid The user's unique ID.
 * @param data The data to update. This will be merged with existing data.
 */
export const updateUser = async (uid: string, data: Partial<User>) => {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
};

export async function getUserByUsername(username: string): Promise<User | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getUsersByIds(uids: string[]): Promise<User[]> {
    if (uids.length === 0) return [];
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "in", uids));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function searchUsers(searchText: string): Promise<User[]> {
    if (!searchText) return [];
    const lowerCaseQuery = searchText.toLowerCase();
    const usersRef = collection(db, "users");
    
    // This is a simplified search. For production, consider a dedicated search service like Algolia.
    // This queries by username and handle prefixes.
    const usernameQuery = query(usersRef, where('username', '>=', lowerCaseQuery), where('username', '<=', lowerCaseQuery + '\uf8ff'));
    const handleQuery = query(usersRef, where('handle', '>=', lowerCaseQuery), where('handle', '<=', lowerCaseQuery + '\uf8ff'));

    const [usernameSnapshot, handleSnapshot] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(handleQuery)
    ]);

    const usersMap = new Map<string, User>();
    usernameSnapshot.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() } as User));
    handleSnapshot.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() } as User));
    
    return Array.from(usersMap.values());
}
