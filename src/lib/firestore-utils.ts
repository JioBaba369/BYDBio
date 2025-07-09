
import { Timestamp, type DocumentSnapshot, type QueryDocumentSnapshot } from 'firebase/firestore';

/**
 * Serializes a Firestore document snapshot by converting Timestamps to ISO strings.
 * @param doc The Firestore document snapshot.
 * @returns A serialized object or null if the document has no data.
 */
export const serializeDocument = <T>(doc: DocumentSnapshot | QueryDocumentSnapshot): T | null => {
    const data = doc.data();
    if (!data) return null;

    const serializedData: { [key: string]: any } = { id: doc.id };
    for (const key in data) {
        const value = data[key];
        if (value instanceof Timestamp) {
            serializedData[key] = value.toDate().toISOString();
        } else {
            serializedData[key] = value;
        }
    }
    return serializedData as T;
};
