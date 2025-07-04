
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';

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

export const getEventsForDiary = async (userId: string) => {
    const ownEventsQuery = query(collection(db, 'events'), where('authorId', '==', userId));
    const rsvpedEventsQuery = query(collection(db, 'events'), where('rsvps', 'array-contains', userId));

    const [ownEventsSnapshot, rsvpedEventsSnapshot] = await Promise.all([
        getDocs(ownEventsQuery),
        getDocs(rsvpedEventsQuery)
    ]);
    
    const eventsMap = new Map<string, any>();
    const authorsToFetch = new Set<string>();

    ownEventsSnapshot.forEach(doc => {
        eventsMap.set(doc.id, { ...doc.data(), id: doc.id, source: 'created' });
    });

    rsvpedEventsSnapshot.forEach(doc => {
        // Avoid adding duplicates if user RSVP'd to their own event
        if (!eventsMap.has(doc.id)) {
            const data = doc.data();
            eventsMap.set(doc.id, { ...data, id: doc.id, source: 'rsvped' });
            authorsToFetch.add(data.authorId);
        }
    });

    const notesQuery = query(collection(db, 'diaryNotes'), where('userId', '==', userId));
    const notesSnapshot = await getDocs(notesQuery);
    const notesMap = new Map<string, string>();
    notesSnapshot.forEach(doc => {
        notesMap.set(doc.data().eventId, doc.data().notes);
    });

    const authorsMap = new Map<string, User>();
    if (authorsToFetch.size > 0) {
        const authorsQuery = query(collection(db, 'users'), where('uid', 'in', Array.from(authorsToFetch)));
        const authorsSnapshot = await getDocs(authorsQuery);
        authorsSnapshot.forEach(doc => {
            authorsMap.set(doc.id, { id: doc.id, ...doc.data() } as User);
        });
    }

    return Array.from(eventsMap.values()).map(event => ({
        ...event,
        date: (event.date as Timestamp).toDate(),
        notes: notesMap.get(event.id) || '',
        author: event.source === 'rsvped' ? authorsMap.get(event.authorId) : undefined,
    }));
};
