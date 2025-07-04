
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
  type Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  setDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';

const serializeTimestamps = (data: { [key: string]: any }): { [key: string]: any } => {
    const serializedData: { [key: string]: any } = {};
    for (const key in data) {
        if (data[key] && typeof data[key].toDate === 'function') {
            serializedData[key] = data[key].toDate().toISOString();
        } else {
            serializedData[key] = data[key];
        }
    }
    return serializedData;
};

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
                startDate: (data.startDate as Timestamp).toDate(),
                endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null,
                author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
            } as EventWithAuthor);
        }
    }

    return events.sort((a,b) => (b.startDate as Date).getTime() - (a.startDate as Date).getTime());
};

// Diary notes
export type DiaryNote = {
  id: string;
  userId: string;
  eventId: string;
  notes: string;
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

    createdSnapshot.forEach(doc => {
        eventsMap.set(doc.id, { ...serializeTimestamps(doc.data()), id: doc.id, source: 'created' });
    });

    rsvpedSnapshot.forEach(doc => {
        if (!eventsMap.has(doc.id)) {
            eventsMap.set(doc.id, { ...serializeTimestamps(doc.data()), id: doc.id, source: 'rsvped' });
        }
    });
    
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
export const getCalendarItems = async (userId: string) => {
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
    
    eventsSnapshot.forEach(doc => {
        itemsMap.set(`event-${doc.id}`, { ...serializeTimestamps(doc.data()), id: doc.id, type: 'event', source: 'created' });
    });
    rsvpedEventsSnapshot.forEach(doc => {
        if (!itemsMap.has(`event-${doc.id}`)) {
            itemsMap.set(`event-${doc.id}`, { ...serializeTimestamps(doc.data()), id: doc.id, type: 'event', source: 'rsvped' });
        }
    });
    offersSnapshot.forEach(doc => {
        itemsMap.set(`offer-${doc.id}`, { ...serializeTimestamps(doc.data()), id: doc.id, type: 'offer' });
    });
    jobsSnapshot.forEach(doc => {
        itemsMap.set(`job-${doc.id}`, { ...serializeTimestamps(doc.data()), id: doc.id, type: 'job' });
    });
    listingsSnapshot.forEach(doc => {
        itemsMap.set(`listing-${doc.id}`, { ...serializeTimestamps(doc.data()), id: doc.id, type: 'listing' });
    });

    const allItems = Array.from(itemsMap.values());
    const authorIds = [...new Set(allItems.map(item => item.authorId).filter(Boolean))];
    const authors = authorIds.length > 0 ? await getDocs(query(collection(db, 'users'), where('uid', 'in', authorIds.slice(0, 30)))) : { docs: [] };
    const authorMap = new Map(authors.docs.map(doc => [doc.id, { uid: doc.id, ...doc.data() } as User]));

    return allItems.map(item => {
        const author = authorMap.get(item.authorId);
        
        let primaryDate = item.createdAt; 
        if (item.startDate) {
            primaryDate = item.startDate;
        } else if (item.postingDate) {
            primaryDate = item.postingDate;
        }

        return {
            ...item,
            date: primaryDate,
            author: author ? { name: author.name, username: author.username, avatarUrl: author.avatarUrl } : undefined,
        };
    });
};
