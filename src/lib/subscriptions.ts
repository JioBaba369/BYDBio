
'use server';
import { doc, getDoc, writeBatch, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notifications';
import type { User } from './users';

export type ContentType = 'promoPages' | 'listings' | 'jobs' | 'events' | 'offers';

export const toggleSubscription = async (userId: string, contentId: string, contentType: ContentType, authorId: string, entityTitle: string) => {
    if (userId === authorId) {
        throw new Error("You cannot follow your own content.");
    }

    const userRef = doc(db, 'users', userId);
    const contentRef = doc(db, contentType, contentId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new Error("User not found.");
    }
    const userData = userDoc.data() as User;
    const isSubscribed = userData.subscriptions?.[contentType]?.includes(contentId);

    const batch = writeBatch(db);
    const subscriptionPath = `subscriptions.${contentType}`;

    if (isSubscribed) {
        // Unsubscribe
        batch.update(userRef, { [subscriptionPath]: arrayRemove(contentId) });
        batch.update(contentRef, { followerCount: increment(-1) });
        await batch.commit();
    } else {
        // Subscribe
        batch.update(userRef, { [subscriptionPath]: arrayUnion(contentId) });
        batch.update(contentRef, { followerCount: increment(1) });
        await batch.commit(); // Commit first
        
        // Then create notification
        await createNotification(authorId, 'new_content_follower', userId, { entityId: contentId, entityTitle, entityType: contentType });
    }

    return !isSubscribed; // Return the new subscription status
}
