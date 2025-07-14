
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
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { getUsersByIds } from './users';
import { serializeDocument } from './firestore-utils';

export type Job = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  category?: string;
  subCategory?: string;
  remuneration?: string;
  postingDate: string; // ISO 8601 string
  closingDate?: string | null; // ISO 8601 string
  imageUrl: string | null;
  status: 'active' | 'archived';
  views: number;
  applicants: number;
  followerCount: number;
  createdAt: string; // ISO 8601 string
  searchableKeywords: string[];
  applicationUrl?: string;
  contactInfo?: string;
};

export type JobWithAuthor = Job & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

// Function to fetch a single job by its ID
export const getJob = async (id: string): Promise<Job | null> => {
  const jobDocRef = doc(db, 'jobs', id);
  const jobDoc = await getDoc(jobDocRef);
  if (!jobDoc.exists()) return null;
  return serializeDocument<Job>(jobDoc);
};

// Function to fetch all jobs for a specific user
export const getJobsByUser = async (userId: string): Promise<Job[]> => {
  const jobsRef = collection(db, 'jobs');
  const q = query(jobsRef, where('authorId', '==', userId), where('status', '==', 'active'), orderBy('postingDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => serializeDocument<Job>(doc)).filter((job): job is Job => job !== null);
};

// Function to create a new job
export const createJob = async (userId: string, data: Partial<Omit<Job, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'applicants' | 'postingDate' | 'searchableKeywords' | 'followerCount'>>) => {
  const jobsRef = collection(db, 'jobs');
  const keywords = [
    ...(data.title?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.company?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.description?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.location?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.type?.toLowerCase() ? [data.type.toLowerCase()] : []),
    ...(data.category?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.subCategory?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.contactInfo ? data.contactInfo.toLowerCase().split(' ').filter(Boolean) : [])
  ];

  const docData = {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    postingDate: serverTimestamp(),
    status: 'active' as const,
    views: 0,
    applicants: 0,
    followerCount: 0,
    searchableKeywords: [...new Set(keywords)],
  };

  const docRef = await addDoc(jobsRef, docData);
  return docRef.id;
};

// Function to update an existing job
export const updateJob = async (id: string, data: Partial<Omit<Job, 'id' | 'authorId' | 'createdAt'>>) => {
  const jobDocRef = doc(db, 'jobs', id);
  const dataToUpdate: {[key: string]: any} = { ...data };

  if (
    data.title !== undefined ||
    data.company !== undefined ||
    data.location !== undefined ||
    data.type !== undefined ||
    data.description !== undefined ||
    data.category !== undefined ||
    data.subCategory !== undefined ||
    data.contactInfo !== undefined
  ) {
    const jobDoc = await getDoc(jobDocRef);
    const existingData = jobDoc.data() as Job;
    const newTitle = data.title ?? existingData.title;
    const newCompany = data.company ?? existingData.company;
    const newLocation = data.location ?? existingData.location;
    const newType = data.type ?? existingData.type;
    const newDescription = data.description ?? existingData.description;
    const newCategory = data.category ?? existingData.category;
    const newSubCategory = data.subCategory ?? existingData.subCategory;
    const newContactInfo = data.contactInfo ?? existingData.contactInfo;

    const keywords = [
        ...newTitle.toLowerCase().split(' ').filter(Boolean),
        ...newCompany.toLowerCase().split(' ').filter(Boolean),
        ...newDescription.toLowerCase().split(' ').filter(Boolean),
        ...newLocation.toLowerCase().split(' ').filter(Boolean),
        newType.toLowerCase(),
        ...(newCategory ? newCategory.toLowerCase().split(' ').filter(Boolean) : []),
        ...(newSubCategory ? newSubCategory.toLowerCase().split(' ').filter(Boolean) : []),
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
    const jobPromise = getDoc(doc(db, 'jobs', jobId));
    const [jobDoc] = await Promise.all([jobPromise]);

    if (!jobDoc.exists()) {
        return null;
    }

    const job = serializeDocument<Job>(jobDoc);
    if (!job) return null;

    const authorPromise = getDoc(doc(db, "users", job.authorId));
    const [authorDoc] = await Promise.all([authorPromise]);

    if (!authorDoc.exists()) {
        return null;
    }
    const author = serializeDocument<User>(authorDoc);
    if (!author) return null;

    return { job, author };
}

// Function to get all active jobs from all users
export const getAllJobs = async (): Promise<JobWithAuthor[]> => {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('status', '==', 'active'), orderBy('postingDate', 'desc'));
    const querySnapshot = await getDocs(q);

    const jobDocs = querySnapshot.docs
        .map(doc => serializeDocument<Job>(doc))
        .filter((job): job is Job => !!job);

    if (jobDocs.length === 0) return [];
    
    const authorIds = [...new Set(jobDocs.map(doc => doc.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return jobDocs.map(data => {
        const author = authorMap.get(data.authorId);
        if (!author) return null;
        
        return {
            ...data,
            author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
        } as JobWithAuthor;
    }).filter((job): job is JobWithAuthor => !!job);
};
