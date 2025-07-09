
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  setDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { getUsersByIds } from './users';
import { serializeDocument } from './firestore-utils';

export type ItineraryItem = {
  time: string;
  title: string;
  description: string;
  speaker?: string;
};

export type Event = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  subTitle?: string;
  description: string;
  startDate: string; // ISO 8601 string
  endDate?: string | null; // ISO 8601 string
  location: string;
  category?: string;
  subCategory?: string;
  imageUrl: string | null;
  couponCode?: string;
  ctaLink?: string;
  status: 'active' | 'archived';
  views: number;
  rsvps: string[]; // Array of user UIDs who have RSVP'd
  followerCount: number;
  itinerary: ItineraryItem[];
  createdAt: string; // ISO 8601 string
  searchableKeywords: string[];
};

export type EventWithAuthor = Event & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

export type CalendarItem = {
  id: string;
  type: 'Event' | 'Offer' | 'Job' | 'Listing' | 'Business Page';
  date: string;
  title: string;
  description?: string;
  location?: string;
  category?: string;
  company?: string;
  jobType?: string;
  price?: string;
  imageUrl?: string | null;
  editPath: string;
  isExternal?: boolean;
  status: 'active' | 'archived';
  views?: number;
  clicks?: number;
  claims?: number;
  applicants?: number;
  rsvps?: string[];
};

// Function to fetch a single event by its ID
export const getEvent = async (id: string): Promise<Event | null> => {
  const eventDocRef = doc(db, 'events', id);
  const eventDoc = await getDoc(eventDocRef);
  if (!eventDoc.exists()) return null;
  return serializeDocument<Event>(eventDoc);
};

// Function to fetch all events for a specific user
export const getEventsByUser = async (userId: string): Promise<Event[]> => {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('authorId', '==', userId), where('status', '==', 'active'), orderBy('startDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => serializeDocument<Event>(doc)).filter((event): event is Event => event !== null);
};

// Function to create a new event
export const createEvent = async (userId: string, data: Partial<Omit<Event, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'rsvps' | 'searchableKeywords' | 'followerCount'>>): Promise<string> => {
  const eventsRef = collection(db, 'events');
  
  const keywords = [
    ...(data.title?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.subTitle?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.description?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.location?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.category?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.subCategory?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.couponCode ? data.couponCode.toLowerCase().split(' ') : [])
  ];

  const docData = {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active' as const,
    views: 0,
    rsvps: [],
    followerCount: 0,
    searchableKeywords: [...new Set(keywords)],
  };

  const docRef = await addDoc(eventsRef, docData);
  return docRef.id;
};

// Function to update an existing event
export const updateEvent = async (id: string, data: Partial<Omit<Event, 'id' | 'authorId' | 'createdAt'>>) => {
  const eventDocRef = doc(db, 'events', id);
  const dataToUpdate: {[key: string]: any} = { ...data };

  // Check if any keyword-related fields are being updated
  if (
    data.title !== undefined ||
    data.subTitle !== undefined ||
    data.description !== undefined ||
    data.location !== undefined ||
    data.category !== undefined ||
    data.subCategory !== undefined ||
    data.couponCode !== undefined
  ) {
    const eventDoc = await getDoc(eventDocRef);
    const existingData = eventDoc.data() as Event;
    const newTitle = data.title ?? existingData.title;
    const newSubTitle = data.subTitle ?? existingData.subTitle;
    const newDescription = data.description ?? existingData.description;
    const newLocation = data.location ?? existingData.location;
    const newCategory = data.category ?? existingData.category;
    const newSubCategory = data.subCategory ?? existingData.subCategory;
    const newCouponCode = data.couponCode ?? existingData.couponCode;

    const keywords = [
      ...newTitle.toLowerCase().split(' ').filter(Boolean),
      ...(newSubTitle ? newSubTitle.toLowerCase().split(' ').filter(Boolean) : []),
      ...newDescription.toLowerCase().split(' ').filter(Boolean),
      ...newLocation.toLowerCase().split(' ').filter(Boolean),
      ...(newCategory ? newCategory.toLowerCase().split(' ') : []),
      ...(newSubCategory ? newSubCategory.toLowerCase().split(' ') : []),
      ...(newCouponCode ? newCouponCode.toLowerCase().split(' ') : [])
    ];
    dataToUpdate.searchableKeywords = [...new Set(keywords)];
  }

  await updateDoc(eventDocRef, dataToUpdate);
};

// Function to delete an event
export const deleteEvent = async (id: string) => {
  const eventDocRef = doc(db, 'events', id);
  await deleteDoc(eventDocRef);
};

// Function for a user to RSVP to an event
export const toggleRsvp = async (eventId: string, userId: string) => {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
        throw new Error("Event not found");
    }

    const eventData = eventDoc.data();
    const isRsvped = eventData.rsvps?.includes(userId);

    if (isRsvped) {
        await updateDoc(eventRef, { rsvps: arrayRemove(userId) });
    } else {
        await updateDoc(eventRef, { rsvps: arrayUnion(userId) });
        // Send a notification to the event creator
        await createNotification(eventData.authorId, 'event_rsvp', userId, { entityId: eventId, entityTitle: eventData.title });
    }
    return !isRsvped;
};


// Helper function for public page to get event and its author
export const getEventAndAuthor = async (eventId: string): Promise<{ event: Event; author: User } | null> => {
    const event = await getEvent(eventId);
    if (!event) return null;

    const userDocRef = doc(db, "users", event.authorId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return null;
    }

    const author = { uid: userDoc.id, ...userDoc.data() } as User;
    return { event, author };
}

// Function to get all events from all users (for the public events page)
export const getAllEvents = async (): Promise<EventWithAuthor[]> => {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('status', '==', 'active'), orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);

    const eventDocs = querySnapshot.docs
        .map(doc => serializeDocument<Event>(doc))
        .filter((event): event is Event => !!event);

    if (eventDocs.length === 0) return [];
    
    const authorIds = [...new Set(eventDocs.map(doc => doc.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return eventDocs.map(data => {
        const author = authorMap.get(data.authorId);
        if (!author) return null;

        return {
            ...data,
            author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
        } as EventWithAuthor;
    }).filter((event): event is EventWithAuthor => !!event);
};

// This function fetches ALL content types for a user for the Content Calendar.
export const getCalendarItems = async (userId: string): Promise<CalendarItem[]> => {
    const collectionsToFetch = ['events', 'offers', 'jobs', 'listings', 'promoPages'];
    
    // Fetch only ACTIVE content created by the user
    const userContentPromises = collectionsToFetch.map(c => 
        getDocs(query(
            collection(db, c), 
            where('authorId', '==', userId), 
            where('status', '==', 'active')
        ))
    );
    
    // Also fetch active events the user has RSVP'd to, which might be external
    const rsvpedEventsPromise = getDocs(
        query(collection(db, 'events'), where('rsvps', 'array-contains', userId), where('status', '==', 'active'))
    );

    const snapshots = await Promise.all([...userContentPromises, rsvpedEventsPromise]);
    
    const allItems = new Map<string, any>();

    const processSnapshot = (snapshot: any, type: string, isExternal = false) => {
        snapshot.forEach((doc: any) => {
            const data = doc.data();
            const key = `${type}-${doc.id}`;
            // If it's an external event, only add it if the user isn't the author
            // This prevents duplicating events the user both created and RSVP'd to
            if (isExternal && data.authorId === userId) {
                return;
            }
            // Add or overwrite item in the map. This ensures that if the user created an event
            // and also RSVP'd, we get the authored version (not marked as external).
            allItems.set(key, { ...data, id: doc.id, type, isExternal });
        });
    };

    processSnapshot(snapshots[0], 'event');
    processSnapshot(snapshots[1], 'offer');
    processSnapshot(snapshots[2], 'job');
    processSnapshot(snapshots[3], 'listing');
    processSnapshot(snapshots[4], 'promoPage');
    processSnapshot(snapshots[5], 'event', true); // RSVP'd events are processed as external
    
    const formattedItems = Array.from(allItems.values()).map((item: any) => {
        // Serialize all potential date fields in the item
        const serializedItem = serializeDocument<any>(item);
        if (!serializedItem) return null;

        let primaryDate = serializedItem.startDate || serializedItem.postingDate || serializedItem.createdAt;
        if (!primaryDate) return null;

        const typeMap: { [key: string]: CalendarItem['type'] } = {
            'event': 'Event',
            'offer': 'Offer',
            'job': 'Job',
            'listing': 'Listing',
            'promoPage': 'Business Page',
        };

        const getEditPath = (itemType: string, id: string): string => {
            const pathMap: { [key: string]: string } = {
                'event': `/events/${id}/edit`,
                'offer': `/offers/${id}/edit`,
                'job': `/job/${id}/edit`,
                'listing': `/listings/${id}/edit`,
                'promoPage': `/promo/${id}/edit`,
            };
            return pathMap[itemType] || '/calendar';
        };

        return {
            id: serializedItem.id,
            type: typeMap[item.type],
            date: primaryDate,
            title: serializedItem.title || serializedItem.name,
            description: serializedItem.description,
            location: serializedItem.location,
            category: serializedItem.category,
            company: serializedItem.company,
            jobType: item.type === 'job' ? serializedItem.type : undefined,
            price: serializedItem.price,
            imageUrl: serializedItem.imageUrl,
            editPath: item.isExternal ? `/events/${item.id}` : getEditPath(item.type, serializedItem.id),
            isExternal: item.isExternal || false,
            status: serializedItem.status,
            views: serializedItem.views,
            clicks: serializedItem.clicks,
            claims: serializedItem.claims,
            applicants: serializedItem.applicants,
            rsvps: serializedItem.rsvps,
        };
    }).filter((item): item is CalendarItem => item !== null);

    return formattedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
