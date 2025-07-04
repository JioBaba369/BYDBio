
import {
  doc,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { subHours } from 'date-fns';

export type Reminder = {
  id: string; // Document ID, e.g., `${userId}_${eventId}`
  userId: string;
  eventId: string;
  eventTitle: string;
  remindAt: Timestamp;
  status: 'pending' | 'sent' | 'error';
  createdAt: Timestamp;
};

/**
 * Creates or updates a reminder for a user for a specific event.
 * The reminder is set for one hour before the event's start time.
 * @param userId The ID of the user to remind.
 * @param eventId The ID of the event.
 * @param eventTitle The title of the event.
 * @param eventStartDate The start date of the event.
 */
export const setEventReminder = async (
  userId: string,
  eventId: string,
  eventTitle: string,
  eventStartDate: Date
): Promise<void> => {
  const reminderId = `${userId}_${eventId}`;
  const reminderRef = doc(db, 'reminders', reminderId);

  const remindAt = subHours(eventStartDate, 1);

  await setDoc(reminderRef, {
    userId,
    eventId,
    eventTitle,
    remindAt: remindAt,
    status: 'pending',
    createdAt: serverTimestamp(),
  }, { merge: true });
};
