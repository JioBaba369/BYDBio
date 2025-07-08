
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

export type NotificationType = 'new_follower' | 'new_like' | 'event_rsvp' | 'contact_form_submission' | 'new_content_follower';

export type Notification = {
  id: string; // Document ID
  userId: string; // The user receiving the notification
  actorId: string | null; // The user who performed the action. Null for system or anonymous actions.
  type: NotificationType;
  entityId?: string; // e.g., postId, eventId
  entityType?: 'promoPages' | 'listings' | 'jobs' | 'events' | 'offers';
  entityTitle?: string; // A title or snippet for context
  read: boolean;
  createdAt: Timestamp;
  // Fields for contact form submissions
  senderName?: string;
  senderEmail?: string;
  messageBody?: string;
};

export type NotificationWithActor = Omit<Notification, 'actorId'> & { actor: User | null };

// Create a notification
export const createNotification = async (
  userId: string,
  type: NotificationType,
  actorId: string | null, // Can be null for system actions or anonymous contact forms
  notificationData: {
    entityId?: string;
    entityTitle?: string;
    entityType?: 'promoPages' | 'listings' | 'jobs' | 'events' | 'offers';
    senderName?: string;
    senderEmail?: string;
    messageBody?: string;
  } = {}
) => {
  // Don't notify users about their own actions
  if (userId === actorId) {
    return;
  }
  
  // For user-generated notifications, check the recipient's preferences
  if (actorId) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) return; // Don't create notification for non-existent user
    
    const userData = userDoc.data() as User;
    const settings = userData.notificationSettings;
    
    // Exit if the specific notification type is disabled
    if (type === 'new_follower' && settings?.newFollowers === false) return;
    if (type === 'new_like' && settings?.newLikes === false) return;
    if (type === 'event_rsvp' && settings?.eventRsvps === false) return;
    if (type === 'new_content_follower' && settings?.newFollowers === false) return; // Reuse follower setting
  }
  
  // Proceed to create notification for system messages or if user settings allow
  const notificationsRef = collection(db, 'notifications');
  
  await addDoc(notificationsRef, {
    userId,
    type,
    actorId: actorId || null,
    read: false,
    createdAt: serverTimestamp(),
    ...notificationData,
  });
};

// Get notifications for a user
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
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
  
  return notifications;
};

// Get notifications for a user, populating actor details where applicable
export const getNotificationsWithActors = async (userId: string): Promise<NotificationWithActor[]> => {
  const notifications = await getNotificationsForUser(userId);

  const actorIds = notifications.map(n => n.actorId).filter((id): id is string => !!id);
  const uniqueActorIds = [...new Set(actorIds)];

  const actors = await getUsersByIds(uniqueActorIds);
  const actorMap = new Map(actors.map(actor => [actor.uid, actor]));

  return notifications.map(notification => ({
    ...notification,
    actor: notification.actorId ? (actorMap.get(notification.actorId) || null) : null,
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
