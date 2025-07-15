
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
import { serializeDocument } from './firestore-utils';

export type NotificationType = 'new_follower' | 'new_like' | 'event_rsvp' | 'contact_form_submission' | 'new_content_follower' | 'new_appointment';

export type Notification = {
  id: string; // Document ID
  userId: string; // The user receiving the notification
  actorId: string | null; // The user who performed the action. Null for system or anonymous actions.
  type: NotificationType;
  entityId?: string; // e.g., postId, eventId
  entityType?: 'promoPages' | 'listings' | 'jobs' | 'events' | 'offers';
  entityTitle?: string; // A title or snippet for context
  read: boolean;
  createdAt: string; // Serialized date
  // Fields for contact form submissions
  senderName?: string;
  senderEmail?: string;
  messageBody?: string;
};

export type NotificationWithActor = Omit<Notification, 'actorId' | 'createdAt'> & {
    actor: User | null;
    createdAt: string; // Ensure it's always a string after serialization
};


const NOTIFICATION_FETCH_LIMIT = 50;

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
    if (!userDoc.exists()) {
      console.warn(`Attempted to create notification for non-existent user: ${userId}`);
      return;
    }
    
    const userData = userDoc.data() as User;
    const settings = userData.notificationSettings;
    
    // Exit if the specific notification type is disabled
    if (type === 'new_follower' && settings?.newFollowers === false) return;
    if (type === 'new_like' && settings?.newLikes === false) return;
    if (type === 'event_rsvp' && settings?.eventRsvps === false) return;
    if (type === 'new_content_follower' && settings?.newFollowers === false) return; // Reuse follower setting
    if (type === 'new_appointment' && settings?.eventRsvps === false) return; // Reuse event rsvp setting for now
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
    limit(NOTIFICATION_FETCH_LIMIT)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs
    .map(doc => serializeDocument<Notification>(doc))
    .filter((notif): notif is Notification => notif !== null);
};

// Get notifications for a user, populating actor details where applicable
export const getNotificationsWithActors = async (userId: string): Promise<NotificationWithActor[]> => {
  const notifications = await getNotificationsForUser(userId);

  const actorIds = notifications.map(n => n.actorId).filter((id): id is string => !!id);
  const uniqueActorIds = [...new Set(actorIds)];

  if (uniqueActorIds.length === 0) {
      return notifications.map(n => ({...n, actor: null}));
  }

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


const entityTypePathMap: Record<string, string> = {
    promoPages: 'p',
    listings: 'l',
    jobs: 'job',
    offers: 'offer',
    events: 'events',
};

const getNotificationLink = (notification: NotificationWithActor): string => {
    switch (notification.type) {
        case 'new_follower':
            return notification.actor ? `/u/${notification.actor.username}` : '/connections';
        case 'new_like':
            return `/feed`; // A real app would link to `/posts/${notification.entityId}`
        case 'event_rsvp':
            return `/events/${notification.entityId}`;
        case 'new_appointment':
            return `/my-content?tab=calendar`;
        case 'new_content_follower':
            if (notification.entityType && notification.entityId) {
                const prefix = entityTypePathMap[notification.entityType];
                if (prefix) {
                    return `/${prefix}/${notification.entityId}`;
                }
            }
            return '/explore';
        case 'contact_form_submission':
            return '/inbox';
        default:
            return '/notifications';
    }
};

export { getNotificationLink };
