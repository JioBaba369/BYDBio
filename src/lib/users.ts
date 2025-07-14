
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteUser, type User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";
import { getPostsByUser, type PostWithAuthor } from "./posts";
import { getPublicContentByUser } from "./content";
import { serializeDocument } from "./firestore-utils";

export type BusinessCard = {
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  location?: string;
};

export type UserLink = {
    id?: string;
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

export type DayAvailability = {
    enabled: boolean;
    startTime: string; // e.g., "09:00"
    endTime: string;   // e.g., "17:00"
}

export type BookingSettings = {
    acceptingAppointments: boolean;
    availability: {
        sunday: DayAvailability;
        monday: DayAvailability;
        tuesday: DayAvailability;
        wednesday: DayAvailability;
        thursday: DayAvailability;
        friday: DayAvailability;
        saturday: DayAvailability;
    }
}

export type User = {
  uid: string; // Firebase Auth UID and Document ID
  name: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  bannerUrl?: string;
  avatarFallback: string;
  bio: string;
  hashtags?: string[];
  following: string[]; // Array of user IDs this user follows
  followerCount: number;
  postCount: number;
  links: UserLink[];
  businessCard?: BusinessCard;
  notificationSettings: NotificationSettings;
  subscriptions: Subscriptions;
  fcmTokens?: string[]; // Array of Firebase Cloud Messaging tokens
  searchableKeywords: string[];
  bookingSettings: BookingSettings;
};

export type UserProfilePayload = {
    user: User;
    otherContent: any[];
    isOwner: boolean;
    isFollowedByCurrentUser: boolean;
}


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
        bannerUrl: 'https://placehold.co/1200x400.png',
        avatarFallback: name ? name.charAt(0).toUpperCase() : '?',
        bio: "",
        hashtags: [],
        following: [],
        followerCount: 0,
        postCount: 0,
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
        bookingSettings: {
            acceptingAppointments: false,
            availability: {
                sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
                monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
            },
        },
        fcmTokens: [],
        searchableKeywords: searchableKeywords,
    });
    
    return { isNewUser: true };
};

/**
 * Updates a user's profile document in Firestore and returns the updated document.
 * This is a more robust version that handles missing data gracefully.
 * @param uid The user's unique ID.
 * @param data The data to update. This will be merged with existing data.
 * @returns The full, updated user object.
 */
export const updateUser = async (uid: string, data: Partial<User>): Promise<User | null> => {
    const userDocRef = doc(db, "users", uid);
    const dataToUpdate: { [key: string]: any } = { ...data };

    // If username is being updated, ensure it's lowercase and check for uniqueness
    if (data.username) {
        const newUsername = data.username.toLowerCase();
        dataToUpdate.username = newUsername;

        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && newUsername !== userDoc.data().username) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", newUsername), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error("Username is already taken.");
            }
        }
    }

    // Always recalculate searchableKeywords if any relevant field changes
    const keywordFieldsChanged = 'name' in data || 'username' in data || 'bio' in data || 'businessCard' in data || 'hashtags' in data;

    if (keywordFieldsChanged) {
        const userDoc = await getDoc(userDocRef);
        const existingData = userDoc.exists() ? userDoc.data() as User : {};
        
        // Use new data if available, otherwise fall back to existing data, or finally to an empty state.
        const newName = data.name ?? existingData.name ?? '';
        const newUsername = dataToUpdate.username ?? existingData.username ?? '';
        const newBio = data.bio ?? existingData.bio ?? '';
        const newTitle = data.businessCard?.title ?? existingData.businessCard?.title ?? '';
        const newCompany = data.businessCard?.company ?? existingData.businessCard?.company ?? '';
        const newHashtags = (data.hashtags ?? existingData.hashtags ?? []).map(h => h.replace('#', '').toLowerCase());
        
        dataToUpdate.searchableKeywords = [...new Set([
            ...newName.toLowerCase().split(' ').filter(Boolean),
            newUsername,
            ...(newBio || '').toLowerCase().split(' ').filter(Boolean),
            ...newTitle.toLowerCase().split(' ').filter(Boolean),
            ...newCompany.toLowerCase().split(' ').filter(Boolean),
            ...newHashtags,
        ])];
        
        if (data.name && data.name.length > 0) {
            dataToUpdate.avatarFallback = data.name.charAt(0).toUpperCase();
        }
    }
    
    await updateDoc(userDocRef, dataToUpdate);

    // After updating, fetch and return the full updated document
    const updatedDoc = await getDoc(userDocRef);
    return serializeDocument<User>(updatedDoc);
};

export async function getUserByUsername(username: string): Promise<User | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username.toLowerCase()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    return serializeDocument<User>(querySnapshot.docs[0]);
}

export async function getUserProfileData(username: string, viewerId: string | null): Promise<UserProfilePayload | null> {
    const user = await getUserByUsername(username);
    if (!user) {
        return null;
    }
    
    const otherContent = await getPublicContentByUser(user.uid);
    
    let isFollowedByCurrentUser = false;
    if (viewerId && viewerId !== user.uid) {
        const viewerDoc = await getDoc(doc(db, 'users', viewerId));
        if (viewerDoc.exists()) {
            const viewerData = viewerDoc.data() as User;
            isFollowedByCurrentUser = viewerData.following?.includes(user.uid);
        }
    }
    
    return {
        user,
        otherContent,
        isOwner: viewerId === user.uid,
        isFollowedByCurrentUser
    }
}


export async function getUsersByIds(uids: string[]): Promise<User[]> {
    if (uids.length === 0) return [];
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
            const serialized = serializeDocument<User>(doc);
            if(serialized) users.push(serialized);
        });
    }
    return users.filter(user => user !== null);
}

export async function searchUsers(searchText: string): Promise<User[]> {
    if (!searchText) return [];

    const lowercasedSearchText = searchText.toLowerCase();
    const searchKeywords = lowercasedSearchText.split(' ').filter(Boolean).slice(0, 10);
    const usersRef = collection(db, "users");
    const usersMap = new Map<string, User>();

    if (searchKeywords.length > 0) {
        const nameQuery = query(
            usersRef,
            where('searchableKeywords', 'array-contains-any', searchKeywords),
            limit(25)
        );
        const nameQuerySnapshot = await getDocs(nameQuery);
        nameQuerySnapshot.forEach(doc => {
            const serialized = serializeDocument<User>(doc);
            if (serialized) usersMap.set(doc.id, serialized);
        });
    }

    const usernameQuery = query(
        usersRef,
        where('username', '>=', lowercasedSearchText),
        where('username', '<=', lowercasedSearchText + '\uf8ff'),
        limit(25)
    );
    const usernameQuerySnapshot = await getDocs(usernameQuery);
    usernameQuerySnapshot.forEach(doc => {
        const serialized = serializeDocument<User>(doc);
        if (serialized) usersMap.set(doc.id, serialized);
    });

    return Array.from(usersMap.values());
}


/**
 * Deletes a user's account from Firebase Authentication and their profile from Firestore.
 * This is a destructive action. 
 * @param fbUser The Firebase User object to delete.
 */
export const deleteUserAccount = async (fbUser: FirebaseUser) => {
    const userDocRef = doc(db, "users", fbUser.uid);

    await deleteDoc(userDocRef);
    await deleteUser(fbUser);
};

export const addFcmTokenToUser = async (uid: string, token: string) => {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
        fcmTokens: arrayUnion(token)
    });
};
