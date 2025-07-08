
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
import { formatCurrency } from './utils';
import { createNotification } from './notifications';
import { getUsersByIds } from './users';

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
  description: string;
  startDate: Timestamp | Date | string;
  endDate?: Timestamp | Date | string | null;
  location: string;
  imageUrl: string | null;
  couponCode?: string;
  ctaLink?: string;
  status: 'active' | 'archived';
  views: number;
  rsvps: string[]; // Array of user UIDs who have RSVP'd
  followerCount: number;
  itinerary: ItineraryItem[];
  createdAt: Timestamp | string;
  searchableKeywords: string[];
};

export type EventWithAuthor = Event & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

export type CalendarItem = {
  id: string;
  type: 'Event' | 'Offer' | 'Job' | 'Listing' | 'Promo Page';
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
  if (eventDoc.exists()) {
    const data = eventDoc.data();
    if (!data.startDate) {
        console.warn(`Event ${id} is missing a start date and will be skipped.`);
        return null;
    }
    return { 
        id: eventDoc.id, 
        ...data,
        startDate: (data.startDate as Timestamp).toDate(),
        endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null
    } as Event;
  }
  return null;
};

// Function to fetch all events for a specific user
export const getEventsByUser = async (userId: string): Promise<Event[]> => {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
      const data = doc.data();
      if (!data.startDate || !data.createdAt) {
        console.warn(`Event ${doc.id} for user ${userId} is missing a required date field and will be skipped.`);
        return null;
      }
      return { 
          id: doc.id, 
          ...data,
          startDate: (data.startDate as Timestamp).toDate(),
          endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null
      } as Event
  }).filter((event): event is Event => event !== null);
};

// Function to create a new event
export const createEvent = async (userId: string, data: Partial<Omit<Event, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'rsvps' | 'searchableKeywords' | 'followerCount'>>) => {
  const eventsRef = collection(db, 'events');
  
  const keywords = [
    ...(data.title?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.description?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.location?.toLowerCase().split(' ').filter(Boolean) || []),
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

  await addDoc(eventsRef, docData);
};

// Function to update an existing event
export const updateEvent = async (id: string, data: Partial<Omit<Event, 'id' | 'authorId' | 'createdAt'>>) => {
  const eventDocRef = doc(db, 'events', id);
  const dataToUpdate: {[key: string]: any} = { ...data };

  // Check if any keyword-related fields are being updated
  if (
    data.title !== undefined ||
    data.description !== undefined ||
    data.location !== undefined ||
    data.couponCode !== undefined
  ) {
    const eventDoc = await getDoc(eventDocRef);
    const existingData = eventDoc.data() as Event;
    const newTitle = data.title ?? existingData.title;
    const newDescription = data.description ?? existingData.description;
    const newLocation = data.location ?? existingData.location;
    const newCouponCode = data.couponCode ?? existingData.couponCode;

    const keywords = [
      ...newTitle.toLowerCase().split(' ').filter(Boolean),
      ...newDescription.toLowerCase().split(' ').filter(Boolean),
      ...newLocation.toLowerCase().split(' ').filter(Boolean),
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
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(data => data.startDate); // Ensure event has a start date

    if (eventDocs.length === 0) return [];
    
    const authorIds = [...new Set(eventDocs.map(doc => doc.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return eventDocs.map(data => {
        const author = authorMap.get(data.authorId);
        if (!author) return null;

        return {
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            startDate: (data.startDate as Timestamp).toDate().toISOString(),
            endDate: data.endDate ? (data.endDate as Timestamp).toDate().toISOString() : null,
            author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
        } as EventWithAuthor;
    }).filter((event): event is EventWithAuthor => !!event);
};

const serializeFirestoreTimestamps = (data: any): any => {
    if (!data) return data;
    const serializedData: { [key: string]: any } = {};
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            serializedData[key] = data[key].toDate().toISOString();
        } else if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
             serializedData[key] = serializeFirestoreTimestamps(data[key]);
        }
        else {
            serializedData[key] = data[key];
        }
    }
    return serializedData;
}

// This function fetches ALL content types for a user for the Content Calendar.
export const getCalendarItems = async (userId: string): Promise<CalendarItem[]> => {
    const collectionsToFetch = ['events', 'offers', 'jobs', 'listings', 'promoPages'];
    
    const userContentPromises = collectionsToFetch.map(c => 
        getDocs(query(collection(db, c), where('authorId', '==', userId)))
    );
    
    // Also fetch events the user has RSVP'd to, but didn't create
    const rsvpedEventsPromise = getDocs(
        query(collection(db, 'events'), where('rsvps', 'array-contains', userId))
    );

    const [
        eventsSnapshot,
        offersSnapshot,
        jobsSnapshot,
        listingsSnapshot,
        promoPagesSnapshot,
        rsvpedEventsSnapshot
    ] = await Promise.all([...userContentPromises, rsvpedEventsPromise]);
    
    const allItems = new Map<string, any>();

    const processSnapshot = (snapshot: any, type: string) => {
        snapshot.forEach((doc: any) => {
            const data = doc.data();
            const key = `${type}-${doc.id}`;
            // If it's an event, we only add it if it's not one the user created themselves (to avoid duplicates)
            if (type === 'event_rsvped') {
                if (data.authorId !== userId) {
                    allItems.set(key, { ...data, id: doc.id, type: 'event', isExternal: true });
                }
            } else {
                // For user-created content, always add it.
                allItems.set(key, { ...data, id: doc.id, type });
            }
        });
    };

    processSnapshot(eventsSnapshot, 'event');
    processSnapshot(offersSnapshot, 'offer');
    processSnapshot(jobsSnapshot, 'job');
    processSnapshot(listingsSnapshot, 'listing');
    processSnapshot(promoPagesSnapshot, 'promoPage');
    processSnapshot(rsvpedEventsSnapshot, 'event_rsvped');
    
    const formattedItems: CalendarItem[] = Array.from(allItems.values()).map((item: any) => {
        const serializedItem = serializeFirestoreTimestamps(item);
        let primaryDate = serializedItem.startDate || serializedItem.postingDate || serializedItem.createdAt;
        if (!primaryDate) return null;

        const getEditPath = (itemType: string, id: string): string => {
            switch(itemType) {
                case 'event': return `/events/${id}/edit`;
                case 'offer': return `/offers/${id}/edit`;
                case 'job': return `/opportunities/${id}/edit`;
                case 'listing': return `/listings/${id}/edit`;
                case 'promoPage': return `/promo/${id}/edit`;
                default: return `/calendar`;
            }
        };

        return {
            id: serializedItem.id,
            type: (item.type.charAt(0).toUpperCase() + item.type.slice(1)).replace(/_/g, ' ') as CalendarItem['type'],
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
