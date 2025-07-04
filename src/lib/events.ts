
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
  status: 'active' | 'archived';
  views: number;
  rsvps: string[]; // Array of user UIDs who have RSVP'd
  itinerary: ItineraryItem[];
  createdAt: Timestamp | string;
  searchableKeywords: string[];
};

export type EventWithAuthor = Event & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

export type CalendarItem = {
  id: string;
  type: 'Event' | 'Offer' | 'Job' | 'Listing';
  date: string;
  title: string;
  description: string;
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
  const q = query(eventsRef, where('authorId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
      const data = doc.data();
      if (!data.startDate) {
        console.warn(`Event ${doc.id} for user ${userId} is missing a start date and will be skipped.`);
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
export const createEvent = async (userId: string, data: Omit<Event, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'rsvps' | 'searchableKeywords'>) => {
  const eventsRef = collection(db, 'events');
  const keywords = [
    ...data.title.toLowerCase().split(' ').filter(Boolean),
    ...data.description.toLowerCase().split(' ').filter(Boolean),
    ...data.location.toLowerCase().split(' ').filter(Boolean),
  ];
  await addDoc(eventsRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    views: 0,
    rsvps: [],
    searchableKeywords: [...new Set(keywords)],
  });
};

// Function to update an existing event
export const updateEvent = async (id: string, data: Partial<Omit<Event, 'id' | 'authorId' | 'createdAt'>>) => {
  const eventDocRef = doc(db, 'events', id);
  const dataToUpdate = { ...data };

  if (data.title || data.description || data.location) {
    const eventDoc = await getDoc(eventDocRef);
    const existingData = eventDoc.data() as Event;
    const newTitle = data.title ?? existingData.title;
    const newDescription = data.description ?? existingData.description;
    const newLocation = data.location ?? existingData.location;

    const keywords = [
      ...newTitle.toLowerCase().split(' ').filter(Boolean),
      ...newDescription.toLowerCase().split(' ').filter(Boolean),
      ...newLocation.toLowerCase().split(' ').filter(Boolean),
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
        await createNotification(eventData.authorId, 'event_rsvp', userId, eventId, eventData.title);
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
    const q = query(eventsRef, where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);

    const events: EventWithAuthor[] = [];
    const authorCache: { [key: string]: User } = {};

    for (const eventDoc of querySnapshot.docs) {
        const data = eventDoc.data();
        if (!data.startDate) {
            console.warn(`Event ${eventDoc.id} is missing a start date and will be skipped from getAllEvents.`);
            continue;
        }
        
        const authorId = data.authorId;
        let author = authorCache[authorId];

        if (!author) {
            const userDoc = await getDoc(doc(db, 'users', authorId));
            if (userDoc.exists()) {
                author = { uid: userDoc.id, ...userDoc.data() } as User;
                authorCache[authorId] = author;
            }
        }
        
        if (author) {
            events.push({
                id: eventDoc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                startDate: (data.startDate as Timestamp).toDate().toISOString(),
                endDate: data.endDate ? (data.endDate as Timestamp).toDate().toISOString() : null,
                author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
            } as EventWithAuthor);
        }
    }

    return events.sort((a,b) => new Date(b.startDate as string).getTime() - new Date(a.startDate as string).getTime());
};

// Diary notes
export type DiaryNote = {
  id: string;
  userId: string;
  eventId: string;
  notes: string;
}

const serializeFirestoreTimestamps = (data: any): any => {
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


export const getDiaryNote = async (userId: string, eventId: string): Promise<DiaryNote | null> => {
    const noteRef = doc(db, 'diaryNotes', `${userId}_${eventId}`);
    const noteDoc = await getDoc(noteRef);
    if (noteDoc.exists()) {
        return noteDoc.data() as DiaryNote;
    }
    return null;
}

export const saveDiaryNote = async (userId: string, eventId: string, notes: string) => {
    const noteRef = doc(db, 'diaryNotes', `${userId}_${eventId}`);
    await setDoc(noteRef, { userId, eventId, notes }, { merge: true });
}

/**
 * Fetches all events for a user's diary, including created and RSVP'd events, and their personal notes.
 * @param userId The UID of the user.
 * @returns A sorted array of events for the user's diary.
 */
export const getDiaryEvents = async (userId: string): Promise<any[]> => {
    const createdEventsQuery = query(collection(db, 'events'), where('authorId', '==', userId));
    const rsvpedEventsQuery = query(collection(db, 'events'), where('rsvps', 'array-contains', userId));

    const [createdSnapshot, rsvpedSnapshot] = await Promise.all([
        getDocs(createdEventsQuery),
        getDocs(rsvpedEventsQuery),
    ]);
    
    const eventsMap = new Map<string, any>();
    
    const processEventDoc = (doc: any, source: 'created' | 'rsvped') => {
        const key = doc.id;
        if (source === 'rsvped' && eventsMap.has(key)) return;
        
        const data = doc.data();
        const serializedData = serializeFirestoreTimestamps(data);
        
        eventsMap.set(key, { ...serializedData, id: doc.id, source });
    }

    createdSnapshot.forEach(doc => processEventDoc(doc, 'created'));
    rsvpedSnapshot.forEach(doc => processEventDoc(doc, 'rsvped'));
    
    const events = Array.from(eventsMap.values());
    if (events.length === 0) return [];
    
    const eventIds = events.map(event => event.id);
    // Firestore 'in' queries are limited to 30 items. Chunk if necessary.
    const notePromises = [];
    for (let i = 0; i < eventIds.length; i += 30) {
        const chunk = eventIds.slice(i, i + 30);
        const notesQuery = query(collection(db, 'diaryNotes'), where('userId', '==', userId), where('eventId', 'in', chunk));
        notePromises.push(getDocs(notesQuery));
    }
    const notesSnapshots = await Promise.all(notePromises);
    const notesMap = new Map<string, string>();
    notesSnapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
            notesMap.set(doc.data().eventId, doc.data().notes);
        });
    });
    
    const authorIds = [...new Set(events.filter(e => e.source === 'rsvped').map(e => e.authorId))];
    const authors = authorIds.length > 0 ? await getDocs(query(collection(db, 'users'), where('uid', 'in', authorIds.slice(0,30)))) : { docs: [] };
    const authorMap = new Map(authors.docs.map(doc => [doc.id, doc.data() as User]));

    return events.map(event => {
        if (!event.startDate) {
            console.warn(`Event ${event.id} in diary is missing a start date and will be skipped.`);
            return null;
        }
        return {
        ...event,
        notes: notesMap.get(event.id) || '',
        author: event.source === 'rsvped' ? authorMap.get(event.authorId) : undefined,
    }}).filter((e): e is any => e !== null);
};

// This function fetches ALL content types for a user for the Content Calendar.
export const getCalendarItems = async (userId: string): Promise<CalendarItem[]> => {
    const eventsQuery = query(collection(db, 'events'), where('authorId', '==', userId));
    const rsvpedEventsQuery = query(collection(db, 'events'), where('rsvps', 'array-contains', userId));
    const offersQuery = query(collection(db, 'offers'), where('authorId', '==', userId));
    const jobsQuery = query(collection(db, 'jobs'), where('authorId', '==', userId));
    const listingsQuery = query(collection(db, 'listings'), where('authorId', '==', userId));
    
    const [
        eventsSnapshot,
        rsvpedEventsSnapshot,
        offersSnapshot,
        jobsSnapshot,
        listingsSnapshot,
    ] = await Promise.all([
        getDocs(eventsQuery),
        getDocs(rsvpedEventsQuery),
        getDocs(offersQuery),
        getDocs(jobsQuery),
        getDocs(listingsQuery),
    ]);

    const itemsMap = new Map<string, any>();
    
    const processDoc = (doc: any, type: string, source?: string) => {
        const key = `${type}-${doc.id}`;
        // Don't overwrite events from `createdEventsQuery` with `rsvpedEventsQuery`
        if (source === 'rsvped' && itemsMap.has(key)) return;

        const data = doc.data();
        const serializedData = serializeFirestoreTimestamps(data);
        
        itemsMap.set(key, { ...serializedData, id: doc.id, type, source });
    };

    eventsSnapshot.forEach(doc => processDoc(doc, 'event', 'created'));
    rsvpedEventsSnapshot.forEach(doc => processDoc(doc, 'event', 'rsvped'));
    offersSnapshot.forEach(doc => processDoc(doc, 'offer'));
    jobsSnapshot.forEach(doc => processDoc(doc, 'job'));
    listingsSnapshot.forEach(doc => processDoc(doc, 'listing'));


    const allItems = Array.from(itemsMap.values());
    
    const formattedItems: CalendarItem[] = allItems.map((item: any) => {
        let primaryDate: string | null = null;
        if (item.type === 'event' || item.type === 'offer') {
            primaryDate = item.startDate;
        } else if (item.type === 'job') {
            primaryDate = item.postingDate;
        } else if (item.type === 'listing') {
            primaryDate = item.createdAt;
        }

        if (!primaryDate) return null;

        switch(item.type) {
            case 'event':
                return {
                    id: item.id,
                    type: 'Event' as const,
                    date: primaryDate,
                    title: item.title,
                    description: `Event at ${item.location}`,
                    location: item.location,
                    imageUrl: item.imageUrl,
                    editPath: `/events/${item.id}/edit`,
                    isExternal: item.source === 'rsvped',
                    status: item.status,
                    views: item.views,
                    rsvps: item.rsvps,
                };
            case 'offer':
                 return {
                    id: item.id,
                    type: 'Offer' as const,
                    date: primaryDate,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    imageUrl: item.imageUrl,
                    editPath: `/offers/${item.id}/edit`,
                    isExternal: false,
                    status: item.status,
                    views: item.views,
                    claims: item.claims,
                };
            case 'job':
                 return {
                    id: item.id,
                    type: 'Job' as const,
                    date: primaryDate,
                    title: item.title,
                    description: `${item.type} at ${item.company}`,
                    company: item.company,
                    jobType: item.type,
                    location: item.location,
                    imageUrl: item.imageUrl,
                    editPath: `/opportunities/${item.id}/edit`,
                    isExternal: false,
                    status: item.status,
                    views: item.views,
                    applicants: item.applicants
                };
            case 'listing':
                 return {
                    id: item.id,
                    type: 'Listing' as const,
                    date: primaryDate,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    editPath: `/listings/${item.id}/edit`,
                    isExternal: false,
                    status: item.status,
                    views: item.views,
                    clicks: item.clicks,
                };
            default:
                return null;
        }
    }).filter((item): item is CalendarItem => item !== null && !!item.date);

    return formattedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
