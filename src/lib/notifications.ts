
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
  limit,
  type Timestamp,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUsersByIds, type User } from './users';

export type NotificationType = 'new_follower' | 'new_like' | 'event_rsvp';

export type Notification = {
  id: string; // Document ID
  userId: string; // The user receiving the notification
  actorId: string; // The user who performed the action
  type: NotificationType;
  entityId?: string; // e.g., postId, eventId
  entityTitle?: string; // A title or snippet for context
  read: boolean;
  createdAt: Timestamp;
};

export type NotificationWithActor = Notification & { actor: User | null };

// Create a notification
export const createNotification = async (
  userId: string,
  type: NotificationType,
  actorId: string,
  entityId?: string,
  entityTitle?: string
) => {
  // Don't notify users about their own actions
  if (userId === actorId) {
    return;
  }

  // Check user's notification preferences
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) return;
  const userData = userDoc.data() as User;
  
  if (type === 'new_follower' && userData.notificationSettings?.newFollowers === false) {
      return; // User has disabled new follower notifications
  }
  if (type === 'new_like' && userData.notificationSettings?.newLikes === false) {
      return; // User has disabled new like notifications
  }
  if (type === 'event_rsvp' && userData.notificationSettings?.eventRsvps === false) {
      return; // User has disabled event rsvp notifications
  }
  
  const notificationsRef = collection(db, 'notifications');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notificationData: any = {
    userId,
    type,
    actorId,
    read: false,
    createdAt: serverTimestamp(),
  };

  if (entityId) {
    notificationData.entityId = entityId;
  }
  if (entityTitle) {
    notificationData.entityTitle = entityTitle;
  }

  await addDoc(notificationsRef, notificationData);
};

// Get notifications for a user
export const getNotificationsForUser = async (userId: string): Promise<NotificationWithActor[]> => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50) // Limit to the last 50 notifications
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return [];
  }

  const notifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));

  const actorIds = [...new Set(notifications.map(n => n.actorId))];
  const actors = await getUsersByIds(actorIds);
  const actorMap = new Map(actors.map(actor => [actor.uid, actor]));

  return notifications.map(notification => ({
    ...notification,
    actor: actorMap.get(notification.actorId) || null,
  }));
};

// Mark a single notification as read
export const markSingleNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
};


// Mark all notifications as read for a user
export const markNotificationsAsRead = async (userId: string) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
};
