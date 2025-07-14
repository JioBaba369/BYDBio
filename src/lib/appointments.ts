
'use server';

import { collection, query, where, getDocs, Timestamp, getDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from './users';
import * as ics from 'ics';
import { parseISO } from 'date-fns';

// A simplified appointment structure for now
export type Appointment = {
  id: string;
  bookerId: string;
  bookerName: string;
  ownerId: string;
  startTime: Timestamp;
  endTime: Timestamp;
};

// Function to fetch a user's appointments for a given day
const getAppointmentsForDay = async (userId: string, day: Date): Promise<Appointment[]> => {
  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999);

  const appointmentsRef = collection(db, 'appointments');
  const q = query(
    appointmentsRef,
    where('ownerId', '==', userId),
    where('startTime', '>=', startOfDay),
    where('startTime', '<=', endOfDay)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Appointment);
};

// Main function to get available slots
export const getAvailableSlots = async (userId: string, selectedDate: Date): Promise<string[]> => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists() || !userDoc.data().bookingSettings?.acceptingAppointments) {
    return [];
  }

  const user = userDoc.data() as User;
  const { availability } = user.bookingSettings!;
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()] as keyof typeof availability;

  const daySettings = availability[dayOfWeek];
  if (!daySettings || !daySettings.enabled) {
    return [];
  }

  const existingAppointments = await getAppointmentsForDay(userId, selectedDate);
  const bookedSlots = new Set(
    existingAppointments.map(apt => apt.startTime.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5))
  );
  
  const availableSlots: string[] = [];
  const meetingDuration = 30; // Assuming 30-minute slots for now

  const [startHour, startMinute] = daySettings.startTime.split(':').map(Number);
  const [endHour, endMinute] = daySettings.endTime.split(':').map(Number);

  let currentTime = new Date(selectedDate);
  currentTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(selectedDate);
  endTime.setHours(endHour, endMinute, 0, 0);

  while (new Date(currentTime.getTime() + meetingDuration * 60000) <= endTime) {
    const slotTime24h = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5);
    
    // Check if slot is in the future and not already booked
    if (currentTime > new Date() && !bookedSlots.has(slotTime24h)) {
      const slotTime12h = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      availableSlots.push(slotTime12h);
    }
    
    // Move to the next slot
    currentTime.setMinutes(currentTime.getMinutes() + meetingDuration);
  }

  return availableSlots;
};

export const createAppointment = async (
  ownerId: string, 
  bookerId: string, 
  bookerName: string, 
  appointmentDate: Date
) => {
  if (ownerId === bookerId) {
    throw new Error("You cannot book an appointment with yourself.");
  }

  const appointmentsRef = collection(db, 'appointments');
  const appointment = {
    ownerId,
    bookerId,
    bookerName,
    startTime: Timestamp.fromDate(appointmentDate),
    endTime: Timestamp.fromDate(new Date(appointmentDate.getTime() + 30 * 60000)), // 30 mins later
  };

  await addDoc(appointmentsRef, appointment);
  
  // You might want to notify the owner here as well
  // await createNotification(ownerId, 'new_appointment', bookerId, { ... });
  
  return { success: true };
};


export const generateIcsContent = (title: string, startTime: string, endTime: string, organizerName: string, organizerEmail: string, attendeeName: string): string | null => {
    const startDate = parseISO(startTime);
    const endDate = parseISO(endTime);
    const icsEvent: ics.EventAttributes = {
        title: title,
        description: `Meeting with ${attendeeName}.`,
        start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
        end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
        organizer: { name: organizerName, email: organizerEmail },
        attendees: [{ name: attendeeName, rsvp: true }]
    };

    const { error, value } = ics.createEvent(icsEvent);

    if (error) {
        console.error(error);
        throw new Error("Error creating ICS file");
    }
    
    return value || null;
}

export const deleteAppointment = async (id: string) => {
  const appointmentDocRef = doc(db, 'appointments', id);
  await deleteDoc(appointmentDocRef);
}
