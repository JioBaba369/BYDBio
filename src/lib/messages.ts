
'use server';

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  type Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Message = {
    id: string;
    recipientId: string;
    senderName: string;
    senderEmail: string;
    message: string;
    read: boolean;
    createdAt: Timestamp | string;
};

export const createMessage = async (recipientId: string, data: Omit<Message, 'id' | 'recipientId' | 'createdAt' | 'read'>) => {
    await addDoc(collection(db, 'messages'), {
        ...data,
        recipientId,
        read: false,
        createdAt: serverTimestamp(),
    });
};

export const getMessagesForUser = async (userId: string): Promise<Message[]> => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('recipientId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // A document might be caught in a weird state without a timestamp.
        // It's safer to just ignore it.
        if (!data.createdAt) {
            return null;
        }
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString()
        } as Message;
    });

    return messages.filter((msg): msg is Message => msg !== null);
};

export const markMessageAsRead = async (messageId: string) => {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { read: true });
};
