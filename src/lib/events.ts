
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
  increment,
  writeBatch,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Listing, Job, Offer } from './users';

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
  date: Timestamp | Date | string; // Allow for server, client, and form states
  location: string;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views: number;
  rsvps: string[]; // Array of user UIDs who have RSVP'd
  itinerary: ItineraryItem[];
  createdAt: Timestamp;
};

export type EventWithAuthor = Event & { author: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl'> };


// Function to fetch a single event by its ID
export const getEvent = async (id: string): Promise<Event | null> => {
  const eventDocRef = doc(db, 'events', id);
  const eventDoc = await getDoc(eventDocRef);
  if (eventDoc.exists()) {
    const data = eventDoc.data();
    return { 
        id: eventDoc.id, 
        ...data,
        date: (data.date as Timestamp).toDate() // Convert Firestore Timestamp to JS Date
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
      return { 
          id: doc.id, 
          ...data,
          date: (data.date as Timestamp).toDate()
      } as Event
  });
};

// Function to create a new event
export const createEvent = async (userId: string, data: Omit<Event, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'rsvps'>) => {
  const eventsRef = collection(db, 'events');
  await addDoc(eventsRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    views: 0,
    rsvps: [],
  });
};

// Function to update an existing event
export const updateEvent = async (id: string, data: Partial<Omit<Event, 'id' | 'authorId' | 'createdAt'>>) => {
  const eventDocRef = doc(db, 'events', id);
  await updateDoc(eventDocRef, data);
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

    const author = { ...userDoc.data(), id: userDoc.id } as User;
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
        const authorId = data.authorId;
        let author = authorCache[authorId];

        if (!author) {
            const userDoc = await getDoc(doc(db, 'users', authorId));
            if (userDoc.exists()) {
                author = { id: userDoc.id, ...userDoc.data() } as User;
                authorCache[authorId] = author;
            }
        }
        
        if (author) {
            events.push({
                id: eventDoc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
                author: { id: author.id, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
            } as EventWithAuthor);
        }
    }

    return events.sort((a,b) => (b.date as Date).getTime() - (a.date as Date).getTime());
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

// This function now fetches ALL content types for a user for the calendar view.
export const getEventsForDiary = async (userId: string) => {
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
        itemsMap.set(`event-${doc.id}`, { ...doc.data(), id: doc.id, type: 'event', source: 'created' });
    });
    rsvpedEventsSnapshot.forEach(doc => {
        if (!itemsMap.has(`event-${doc.id}`)) {
            itemsMap.set(`event-${doc.id}`, { ...doc.data(), id: doc.id, type: 'event', source: 'rsvped' });
        }
    });
    offersSnapshot.forEach(doc => {
        itemsMap.set(`offer-${doc.id}`, { ...doc.data(), id: doc.id, type: 'offer' });
    });
    jobsSnapshot.forEach(doc => {
        itemsMap.set(`job-${doc.id}`, { ...doc.data(), id: doc.id, type: 'job' });
    });
    listingsSnapshot.forEach(doc => {
        itemsMap.set(`listing-${doc.id}`, { ...doc.data(), id: doc.id, type: 'listing' });
    });

    return Array.from(itemsMap.values()).map(item => {
        const dateFields: any = {};
        if (item.date) dateFields.date = (item.date as Timestamp).toDate();
        if (item.releaseDate) dateFields.releaseDate = (item.releaseDate as Timestamp).toDate();
        if (item.postingDate) dateFields.postingDate = (item.postingDate as Timestamp).toDate();
        // Listings don't have a date for the calendar, but we can use createdAt
        if (item.type === 'listing' && item.createdAt) dateFields.publishDate = (item.createdAt as Timestamp).toDate();
        
        return {
            ...item,
            ...dateFields,
        };
    });
};
