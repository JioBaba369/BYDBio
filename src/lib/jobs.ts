
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';

export type Job = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  postingDate: Timestamp | Date | string;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views: number;
  applicants: number;
  createdAt: Timestamp | string;
};

// Function to fetch a single job by its ID
export const getJob = async (id: string): Promise<Job | null> => {
  const jobDocRef = doc(db, 'jobs', id);
  const jobDoc = await getDoc(jobDocRef);
  if (jobDoc.exists()) {
    const data = jobDoc.data();
    return { 
        id: jobDoc.id, 
        ...data,
        postingDate: (data.postingDate as Timestamp).toDate()
    } as Job;
  }
  return null;
};

// Function to fetch all jobs for a specific user
export const getJobsByUser = async (userId: string): Promise<Job[]> => {
  const jobsRef = collection(db, 'jobs');
  const q = query(jobsRef, where('authorId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id, 
          ...data,
          postingDate: (data.postingDate as Timestamp).toDate()
      } as Job;
  });
};

// Function to create a new job
export const createJob = async (userId: string, data: Omit<Job, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'applicants' | 'postingDate'>) => {
  const jobsRef = collection(db, 'jobs');
  await addDoc(jobsRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    postingDate: serverTimestamp(),
    status: 'active',
    views: 0,
    applicants: 0,
  });
};

// Function to update an existing job
export const updateJob = async (id: string, data: Partial<Omit<Job, 'id' | 'authorId' | 'createdAt'>>) => {
  const jobDocRef = doc(db, 'jobs', id);
  await updateDoc(jobDocRef, data);
};

// Function to delete a job
export const deleteJob = async (id: string) => {
  const jobDocRef = doc(db, 'jobs', id);
  await deleteDoc(jobDocRef);
};

// Helper function for public page to get job and its author
export const getJobAndAuthor = async (jobId: string): Promise<{ job: Job; author: User } | null> => {
    const job = await getJob(jobId);
    if (!job) return null;

    const userDocRef = doc(db, "users", job.authorId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return null;
    }

    const author = { ...userDoc.data(), id: userDoc.id } as User;
    return { job, author };
}
