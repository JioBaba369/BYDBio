
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
  startDate?: Timestamp | Date | string | null;
  endDate?: Timestamp | Date | string | null;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views: number;
  applicants: number;
  createdAt: Timestamp | string;
  searchableKeywords: string[];
};

// Function to fetch a single job by its ID
export const getJob = async (id: string): Promise<Job | null> => {
  const jobDocRef = doc(db, 'jobs', id);
  const jobDoc = await getDoc(jobDocRef);
  if (jobDoc.exists()) {
    const data = jobDoc.data();
    if (!data.postingDate) {
        console.warn(`Job ${id} is missing a postingDate and will be skipped.`);
        return null;
    }
    return { 
        id: jobDoc.id, 
        ...data,
        postingDate: (data.postingDate as Timestamp).toDate(),
        startDate: data.startDate ? (data.startDate as Timestamp).toDate() : null,
        endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null,
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
       if (!data.postingDate) {
          console.warn(`Job ${doc.id} for user ${userId} is missing a postingDate and will be skipped.`);
          return null;
      }
      return { 
          id: doc.id, 
          ...data,
          postingDate: (data.postingDate as Timestamp).toDate(),
          startDate: data.startDate ? (data.startDate as Timestamp).toDate() : null,
          endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null,
      } as Job;
  }).filter((job): job is Job => job !== null);
};

// Function to create a new job
export const createJob = async (userId: string, data: Omit<Job, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'applicants' | 'postingDate' | 'searchableKeywords'>) => {
  const jobsRef = collection(db, 'jobs');
  const keywords = [
    ...data.title.toLowerCase().split(' ').filter(Boolean),
    ...data.company.toLowerCase().split(' ').filter(Boolean),
    ...data.location.toLowerCase().split(' ').filter(Boolean),
    data.type.toLowerCase(),
  ];

  await addDoc(jobsRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    postingDate: serverTimestamp(),
    status: 'active',
    views: 0,
    applicants: 0,
    searchableKeywords: [...new Set(keywords)],
  });
};

// Function to update an existing job
export const updateJob = async (id: string, data: Partial<Omit<Job, 'id' | 'authorId' | 'createdAt'>>) => {
  const jobDocRef = doc(db, 'jobs', id);
  const dataToUpdate = { ...data };

  if (data.title || data.company || data.location || data.type) {
    const jobDoc = await getDoc(jobDocRef);
    const existingData = jobDoc.data() as Job;
    const newTitle = data.title ?? existingData.title;
    const newCompany = data.company ?? existingData.company;
    const newLocation = data.location ?? existingData.location;
    const newType = data.type ?? existingData.type;

    const keywords = [
        ...newTitle.toLowerCase().split(' ').filter(Boolean),
        ...newCompany.toLowerCase().split(' ').filter(Boolean),
        ...newLocation.toLowerCase().split(' ').filter(Boolean),
        newType.toLowerCase(),
    ];
    dataToUpdate.searchableKeywords = [...new Set(keywords)];
  }

  await updateDoc(jobDocRef, dataToUpdate);
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

    const author = { uid: userDoc.id, ...userDoc.data() } as User;
    return { job, author };
}
