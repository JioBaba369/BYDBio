
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
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';

export type Job = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  remuneration?: string;
  postingDate: Timestamp | Date | string;
  closingDate?: Timestamp | Date | string | null;
  startDate?: Timestamp | Date | string | null;
  endDate?: Timestamp | Date | string | null;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views: number;
  applicants: number;
  createdAt: Timestamp | string;
  searchableKeywords: string[];
  applicationUrl?: string;
  contactInfo?: string;
};

export type JobWithAuthor = Job & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

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
        closingDate: data.closingDate ? (data.closingDate as Timestamp).toDate() : null,
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
       if (!data.postingDate || !data.createdAt) {
          console.warn(`Job ${doc.id} for user ${userId} is missing a required date field and will be skipped.`);
          return null;
      }
      return { 
          id: doc.id, 
          ...data,
          postingDate: (data.postingDate as Timestamp).toDate(),
          closingDate: data.closingDate ? (data.closingDate as Timestamp).toDate() : null,
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
    ...data.description.toLowerCase().split(' ').filter(Boolean),
    ...data.location.toLowerCase().split(' ').filter(Boolean),
    data.type.toLowerCase(),
    ...(data.contactInfo ? data.contactInfo.toLowerCase().split(' ').filter(Boolean) : [])
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

  if (data.title || data.company || data.location || data.type || data.description || data.contactInfo) {
    const jobDoc = await getDoc(jobDocRef);
    const existingData = jobDoc.data() as Job;
    const newTitle = data.title ?? existingData.title;
    const newCompany = data.company ?? existingData.company;
    const newLocation = data.location ?? existingData.location;
    const newType = data.type ?? existingData.type;
    const newDescription = data.description ?? existingData.description;
    const newContactInfo = data.contactInfo ?? existingData.contactInfo;

    const keywords = [
        ...newTitle.toLowerCase().split(' ').filter(Boolean),
        ...newCompany.toLowerCase().split(' ').filter(Boolean),
        ...newDescription.toLowerCase().split(' ').filter(Boolean),
        ...newLocation.toLowerCase().split(' ').filter(Boolean),
        newType.toLowerCase(),
        ...(newContactInfo ? newContactInfo.toLowerCase().split(' ').filter(Boolean) : [])
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

// Function to get all active jobs from all users
export const getAllJobs = async (): Promise<JobWithAuthor[]> => {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('status', '==', 'active'), orderBy('postingDate', 'desc'));
    const querySnapshot = await getDocs(q);

    const jobs: JobWithAuthor[] = [];
    const authorCache: { [key: string]: User } = {};

    for (const jobDoc of querySnapshot.docs) {
        const data = jobDoc.data();
        if (!data.postingDate) {
            console.warn(`Job ${jobDoc.id} is missing a postingDate and will be skipped.`);
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
            jobs.push({
                id: jobDoc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                postingDate: (data.postingDate as Timestamp).toDate().toISOString(),
                closingDate: data.closingDate ? (data.closingDate as Timestamp).toDate().toISOString() : null,
                startDate: data.startDate ? (data.startDate as Timestamp).toDate().toISOString() : null,
                endDate: data.endDate ? (data.endDate as Timestamp).toDate().toISOString() : null,
                author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
            } as JobWithAuthor);
        }
    }

    return jobs;
};
