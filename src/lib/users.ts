
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
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

export type Subscriptions = {
  promoPages: string[];
  listings: string[];
  jobs: string[];
  events: string[];
  offers: string[];
}

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
  subscriptions: Subscriptions;
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
 * @returns An object indicating if the user was new.
 */
export const createUserProfileIfNotExists = async (user: FirebaseUser, additionalData?: { name?: string }): Promise<{ isNewUser: boolean }> => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return { isNewUser: false };
    }

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
        subscriptions: {
            promoPages: [],
            listings: [],
            jobs: [],
            events: [],
            offers: [],
        },
        searchableKeywords: searchableKeywords,
    });
    
    return { isNewUser: true };
};

/**
 * Updates a user's profile document in Firestore.
 * @param uid The user's unique ID.
 * @param data The data to update. This will be merged with existing data.
 */
export const updateUser = async (uid: string, data: Partial<User>) => {
    const userDocRef = doc(db, "users", uid);
    const dataToUpdate: { [key: string]: any } = { ...data };

    // If username is being updated, check for uniqueness first
    if (data.username) {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && data.username !== userDoc.data().username) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", data.username), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error("Username is already taken.");
            }
        }
    }
    
    // If name or username is being updated, also update searchableKeywords and avatarFallback
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
            // Only update the fallback if the name is explicitly being changed.
            if(data.name) {
                dataToUpdate.avatarFallback = data.name.charAt(0).toUpperCase();
            }
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
    
    const searchKeywords = searchText.toLowerCase().split(' ').filter(Boolean).slice(0, 10);
    if (searchKeywords.length === 0) return [];

    const usersRef = collection(db, "users");
    
    // Use array-contains-any for multi-keyword search
    const q = query(usersRef, where('searchableKeywords', 'array-contains-any', searchKeywords));

    const querySnapshot = await getDocs(q);

    const usersMap = new Map<string, User>();
    querySnapshot.forEach(doc => usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as User));
    
    return Array.from(usersMap.values());
}


/**
 * Deletes a user's account from Firebase Authentication.
 * This is a destructive action. For a production app, all associated user data in Firestore
 * (profile, posts, events, etc.) should be cleaned up via a Cloud Function that triggers
 * on user deletion (`functions.auth.user().onDelete()`).
 * @param fbUser The Firebase User object to delete.
 */
export const deleteUserAccount = async (fbUser: FirebaseUser) => {
    // Deleting the user from Firebase Auth is the primary action.
    // The SDK will throw an error if re-authentication is needed, which is caught by the calling component.
    await deleteUser(fbUser);

    // IMPORTANT: In a production application, you should set up a Cloud Function
    // triggered by `onDelete` to remove the user's document from the 'users' collection
    // and all other content they have created. Deleting documents from the client-side
    // after auth deletion is unreliable and not recommended.
};
