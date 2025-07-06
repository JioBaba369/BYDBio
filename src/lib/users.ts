
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteUser, type User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

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

export type NotificationSettings = {
    newFollowers: boolean;
    newLikes: boolean;
    eventRsvps: boolean;
    offersAndUpdates: boolean;
};

export type User = {
  uid: string; // Firebase Auth UID and Document ID
  name: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  avatarFallback: string;
  bio: string;
  following: string[]; // Array of user IDs this user follows
  followerCount: number;
  links: UserLink[];
  businessCard?: BusinessCard;
  notificationSettings: NotificationSettings;
  searchableKeywords: string[];
  isFollowedByCurrentUser?: boolean; // Client-side state
};

const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
    let username = baseUsername;
    let isUnique = false;
    let attempts = 0;

    if (username.length < 3) {
        username = `user${username}`;
    }

    while (!isUnique && attempts < 10) { // Limit attempts to prevent infinite loops
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            isUnique = true;
        } else {
            // Append 3 random digits
            const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
            username = `${baseUsername.slice(0, 20)}${randomSuffix}`; // Slice to prevent overly long usernames
            attempts++;
        }
    }
    
    if (!isUnique) {
        // Fallback to a highly unique username if all attempts fail
        return `user${Date.now().toString().slice(-6)}`;
    }
    return username;
}


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
        const baseUsername = user.email?.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `user`;
        const username = await generateUniqueUsername(baseUsername);
        const name = additionalData?.name || user.displayName || "New User";

        const searchableKeywords = [...new Set([
            ...name.toLowerCase().split(' ').filter(Boolean),
            username.toLowerCase()
        ])];

        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: name,
            username: username,
            avatarUrl: user.photoURL || `https://placehold.co/200x200.png`,
            avatarFallback: name.charAt(0).toUpperCase(),
            bio: "",
            following: [],
            followerCount: 0,
            links: [],
            businessCard: {},
            notificationSettings: {
                newFollowers: true,
                newLikes: true,
                eventRsvps: true,
                offersAndUpdates: true,
            },
            searchableKeywords: searchableKeywords,
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
    const dataToUpdate = { ...data };

    // If name or username is being updated, also update searchableKeywords
    if (data.name || data.username) {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const existingData = userDoc.data() as User;
            const newName = data.name ?? existingData.name;
            const newUsername = data.username ?? existingData.username;
            dataToUpdate.searchableKeywords = [...new Set([
                ...newName.toLowerCase().split(' ').filter(Boolean),
                newUsername.toLowerCase()
            ])];
        }
    }
    await updateDoc(userDocRef, dataToUpdate);
};

export async function getUserByUsername(username: string): Promise<User | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { uid: userDoc.id, ...userDoc.data() } as User;
}

export async function getUsersByIds(uids: string[]): Promise<User[]> {
    if (uids.length === 0) return [];
    // Firestore 'in' queries are limited to 30 items per query.
    // We need to chunk the requests.
    const chunks: string[][] = [];
    for (let i = 0; i < uids.length; i += 30) {
        chunks.push(uids.slice(i, i + 30));
    }
    
    const users: User[] = [];
    for (const chunk of chunks) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "in", chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            users.push({ uid: doc.id, ...doc.data() } as User)
        });
    }
    return users;
}

export async function searchUsers(searchText: string): Promise<User[]> {
    if (!searchText) return [];
    const lowerCaseQuery = searchText.toLowerCase();
    const usersRef = collection(db, "users");
    
    // This is a simplified search. For production, consider a dedicated search service like Algolia.
    const q = query(usersRef, where('searchableKeywords', 'array-contains', lowerCaseQuery));

    const querySnapshot = await getDocs(q);

    const usersMap = new Map<string, User>();
    querySnapshot.forEach(doc => usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as User));
    
    return Array.from(usersMap.values());
}


/**
 * Deletes a user's account from Firebase Authentication and their profile from Firestore.
 * This is a destructive action. For a production app, related content should be cleaned up
 * via a Cloud Function to ensure all associated data is removed.
 * @param fbUser The Firebase User object to delete.
 */
export const deleteUserAccount = async (fbUser: FirebaseUser) => {
    // 1. Delete user's profile document from Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    await deleteDoc(userDocRef);

    // 2. Delete user from Firebase Auth
    // This is the last step. It requires recent sign-in, which will be handled by Firebase Auth SDK.
    // The SDK will throw an error if re-authentication is needed, which should be caught by the calling component.
    await deleteUser(fbUser);
};
