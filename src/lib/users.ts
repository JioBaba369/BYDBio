
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

// In a real app, this data would come from a database.
// It's defined here for demonstration purposes.

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  publishDate: string;
  status: 'active' | 'archived';
  views?: number;
  clicks?: number;
};

export type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  timestamp: string;
  likes: number;
  comments: number;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  category: string;
  releaseDate: string;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views?: number;
  claims?: number;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postingDate: string;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views?: number;
  applicants?: number;
};

export type ItineraryItem = {
  time: string;
  title: string;
  description: string;
  speaker?: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views?: number;
  rsvps?: number;
  attendees?: { id: string; name: string; avatarUrl: string; }[];
  itinerary?: ItineraryItem[];
};

export type Business = {
  id: string;
  name: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  status: 'active' | 'archived';
  views?: number;
  clicks?: number;
};

export type BusinessCard = {
  title: string;
  company: string;
  phone?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  location?: string;
};

export type UserLink = {
    icon: string;
    title: string;
    url: string;
}

export type User = {
  id: string;
  name: string;
  handle: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  bio: string;
  following: string[]; // Array of user IDs this user follows
  jobs: Job[];
  events: Event[];
  offers: Offer[];
  listings: Listing[];
  posts: Post[];
  businesses: Business[];
  subscribers: number;
  links: UserLink[];
  businessCard?: BusinessCard;
  rsvpedEventIds?: string[];
  uid: string;
  email?: string;
};

/**
 * Creates a user profile in Firestore if one doesn't already exist.
 * This prevents overwriting data on subsequent logins.
 * @param user The user object from Firebase Authentication.
 * @param additionalData Additional data to include in the profile, like the name from the sign-up form.
 */
export const createUserProfileIfNotExists = async (user: FirebaseUser, additionalData?: { name?: string }) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const username = user.email?.split('@')[0] || `user${user.uid.substring(0,5)}`;
        // In a real app, you might want to check if this username is unique and handle collisions.
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: additionalData?.name || user.displayName || "New User",
            username: username,
            handle: username,
            avatarUrl: user.photoURL || `https://placehold.co/200x200.png`,
            avatarFallback: (additionalData?.name || user.displayName)?.charAt(0).toUpperCase() || 'U',
            bio: "",
            following: [],
            subscribers: 0,
            links: [],
            jobs: [],
            events: [],
            offers: [],
            listings: [],
            posts: [],
            businesses: [],
            rsvpedEventIds: [],
            businessCard: {},
        });
    }
};

/**
 * Updates a user's profile document in Firestore.
 * @param uid The user's unique ID.
 * @param data The data to update. This will be merged with existing data.
 */
export const updateUser = async (uid: string, data: Partial<User>) => {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
};

export async function getUserByUsername(username: string): Promise<User | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    return userDoc.data() as User;
}


const user1Businesses: Business[] = [
  {
    id: 'biz1',
    name: 'Acme Inc. Design Studio',
    description: 'A full-service design agency specializing in branding, web design, and user experience for tech startups.',
    email: 'hello@acme.design',
    phone: '+1 (555) 555-1234',
    website: 'https://acme.design',
    address: '123 Design St, San Francisco, CA 94105',
    imageUrl: 'https://placehold.co/1200x400.png',
    logoUrl: 'https://placehold.co/200x200.png',
    status: 'active',
    views: 2451,
    clicks: 832,
  },
  {
    id: 'biz2',
    name: 'Side Hustle Icons',
    description: 'A digital marketplace for high-quality, handcrafted icon sets for developers and designers.',
    email: 'support@sidehustleicons.com',
    website: 'https://sidehustleicons.com',
    address: 'Remote',
    phone: '',
    imageUrl: 'https://placehold.co/1200x400.png',
    logoUrl: 'https://placehold.co/200x200.png',
    status: 'active',
    views: 890,
    clicks: 120,
  },
  {
    id: 'biz3',
    name: 'Archived Ventures',
    description: 'This is an archived business page for demonstration purposes.',
    email: 'archive@example.com',
    website: 'https://archive.example.com',
    address: 'N/A',
    phone: '',
    imageUrl: 'https://placehold.co/1200x400.png',
    logoUrl: 'https://placehold.co/200x200.png',
    status: 'archived',
    views: 150,
    clicks: 12,
  }
];


export const allUsers: User[] = [
  {
    id: 'user1',
    uid: 'user1',
    name: 'Jane Doe',
    handle: 'janedoe',
    username: 'janedoe',
    avatarUrl: 'https://placehold.co/200x200.png',
    avatarFallback: 'JD',
    bio: "Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs. Passionate about design systems and accessibility.",
    following: ['user2', 'user4', 'user5'],
    subscribers: 12500,
    links: [
        { title: "Personal Website", url: "https://janedoe.design", icon: 'Globe' },
        { title: "Email Me", url: "mailto:jane.doe@example.com", icon: 'Mail' },
        { title: "Call Me", url: "tel:+15551234567", icon: 'Phone' },
        { title: "LinkedIn", url: "https://linkedin.com/in/janedoe", icon: 'Linkedin' },
        { title: "GitHub", url: "https://github.com/janedoe", icon: 'Github' },
        { title: "Twitter / X", url: "https://twitter.com/janedoe", icon: 'Twitter' },
        { title: "Instagram", url: "https://instagram.com/janedoe.designs", icon: 'Instagram' },
        { title: "Facebook", url: "https://facebook.com/janedoe.creative", icon: 'Facebook' },
        { title: "YouTube", url: "https://youtube.com/@janedoecreates", icon: 'Youtube' },
    ],
    businessCard: {
        title: "Senior Product Designer",
        company: "Acme Inc.",
        phone: "+1 (555) 123-4567",
        email: "jane.doe@acme.com",
        website: "https://janedoe.design",
        linkedin: "https://www.linkedin.com/in/janedoe",
        location: "San Francisco, CA",
    },
    jobs: [
       { id: 'job1', title: 'UX/UI Designer', company: 'Creative Solutions', location: 'Remote', type: 'Full-time', postingDate: '2024-08-20T09:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'active', views: 750, applicants: 42 },
       { id: 'job2', title: 'Frontend Developer', company: 'Tech Innovators', location: 'New York, NY', type: 'Full-time', postingDate: '2024-07-15T09:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'archived', views: 2500, applicants: 120 },
    ],
    events: [
        { 
            id: 'event1', 
            title: 'Design Thinking Workshop', 
            description: 'Join us for an interactive workshop on the principles of design thinking. We will cover empathy mapping, ideation techniques, and prototyping. This session is perfect for designers, product managers, and anyone interested in a human-centered approach to problem-solving. No prior experience is necessary!',
            date: '2024-08-15T14:00:00Z', 
            location: 'Online', 
            imageUrl: 'https://placehold.co/600x400.png', 
            status: 'active', 
            views: 1230, 
            rsvps: 88,
            attendees: [
                { id: 'user2', name: 'John Smith', avatarUrl: 'https://placehold.co/100x100.png' },
                { id: 'user4', name: 'Maria Garcia', avatarUrl: 'https://placehold.co/100x100.png' },
                { id: 'user5', name: 'Chris Lee', avatarUrl: 'https://placehold.co/100x100.png' },
                { id: 'user6', name: 'Patricia Williams', avatarUrl: 'https://placehold.co/100x100.png' },
            ],
            itinerary: [
                {
                    time: '09:00 AM',
                    title: 'Registration & Welcome Coffee',
                    description: 'Check-in, grab your badge, and enjoy some coffee before we kick off.',
                },
                {
                    time: '10:00 AM',
                    title: 'Opening Keynote: The Future of Design',
                    description: 'A look into the upcoming trends and technologies shaping our industry.',
                    speaker: 'Jane Doe',
                },
                {
                    time: '11:00 AM',
                    title: 'Breakout Session: Accessibility in Practice',
                    description: 'Practical tips and techniques for building inclusive products.',
                    speaker: 'John Smith',
                },
                {
                    time: '12:30 PM',
                    title: 'Lunch Break',
                    description: 'Network with fellow attendees over a delicious catered lunch.',
                },
                {
                    time: '02:00 PM',
                    title: 'Workshop: Prototyping with Next-Gen Tools',
                    description: 'A hands-on workshop where you\'ll build an interactive prototype.',
                    speaker: 'Maria Garcia',
                },
                {
                    time: '04:00 PM',
                    title: 'Closing Remarks & Networking',
                    description: 'Final thoughts and an opportunity for open networking.',
                }
            ]
        },
        { 
            id: 'event2', 
            title: 'Past Tech Meetup', 
            description: 'A look back at our monthly tech meetup. We discussed the latest trends in web development, including a deep dive into server components and a showcase of new CSS features. Thanks to all who attended!',
            date: '2024-06-20T18:00:00Z', 
            location: 'San Francisco, CA', 
            imageUrl: 'https://placehold.co/600x400.png', 
            status: 'archived', 
            views: 450, 
            rsvps: 50,
            attendees: [
                { id: 'user3', name: 'Alex Johnson', avatarUrl: 'https://placehold.co/100x100.png' },
            ]
        },
    ],
    offers: [
        { id: 'offer1', title: '1-on-1 Portfolio Review', description: 'Get expert feedback on your design portfolio.', category: 'Consulting', releaseDate: '2024-09-01T10:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'active', views: 980, claims: 112 },
        { id: 'offer2', title: 'Early-Bird Discount: Web Design Course', description: 'Get 20% off my upcoming masterclass.', category: 'Discount', releaseDate: '2024-09-10T00:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'active', views: 2100, claims: 450 },
        { id: 'offer3', title: 'Expired Summer Sale', description: 'This offer is no longer available.', category: 'Sale', releaseDate: '2024-07-31T00:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'archived', views: 5000, claims: 1200 },
    ],
    listings: [
        { id: 'listing1', title: 'Minimalist Icon Set', description: 'A pack of 200+ clean, modern icons for your next project.', price: '$25', imageUrl: 'https://placehold.co/600x400.png', category: 'Digital Asset', publishDate: '2024-08-25T09:00:00Z', status: 'active', views: 1800, clicks: 350 },
        { id: 'listing2', title: 'Web Design Masterclass', description: 'A 10-hour video course on modern web design principles.', price: '$149', imageUrl: 'https://placehold.co/600x400.png', category: 'Education', publishDate: '2024-08-10T09:00:00Z', status: 'active', views: 3200, clicks: 780 },
        { id: 'listing3', title: 'Old UI Kit', description: 'This UI kit is outdated and no longer for sale.', price: '$49', imageUrl: 'https://placehold.co/600x400.png', category: 'UI Kit', publishDate: '2023-01-10T09:00:00Z', status: 'archived', views: 10000, clicks: 2500 },
    ],
    posts: [
      {
        id: 'post1-1',
        content: "Excited to share a sneak peek of the new dashboard design I've been working on. Focusing on a cleaner layout and more intuitive data visualizations. #uidesign #productdesign #dashboard",
        imageUrl: "https://placehold.co/600x400.png",
        timestamp: "2h ago",
        likes: 128,
        comments: 12,
      },
      {
        id: 'post1-2',
        content: "Just launched our new 'Minimalist Icon Set' on the listings page! Perfect for your next project. #icons #digitalasset #designresources",
        imageUrl: null,
        timestamp: "1d ago",
        likes: 256,
        comments: 24,
      }
    ],
    businesses: user1Businesses,
  },
  {
    id: 'user2',
    uid: 'user2',
    name: 'John Smith',
    handle: 'johnsmith',
    username: 'johnsmith',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'JS',
    bio: "Writer and thought leader on the future of work. Exploring remote collaboration and productivity hacks.",
    following: ['user1', 'user4'],
    subscribers: 5100,
    links: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [
      {
        id: 'post2-1',
        content: "Just published a new article on 'The Future of Remote Collaboration'. Would love to hear your thoughts! Link in my bio. #remotework #futureofwork #collaboration",
        imageUrl: null,
        timestamp: "5h ago",
        likes: 72,
        comments: 5,
      }
    ],
    businesses: [],
  },
  {
    id: 'user3',
    uid: 'user3',
    name: 'Alex Johnson',
    handle: 'alexj',
    username: 'alexj',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'AJ',
    bio: "Frontend developer passionate about building beautiful and accessible user interfaces with React and Next.js.",
    following: ['user1'],
    subscribers: 1200,
    links: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
  {
    id: 'user4',
    uid: 'user4',
    name: 'Maria Garcia',
    handle: 'mariag',
    username: 'mariag',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MG',
    bio: "Web developer and CSS enthusiast. Speaker at Web Dev Conference. Sharing tips on modern web technologies.",
    following: ['user1', 'user2'],
    subscribers: 8700,
    links: [],
    jobs: [],
    events: [
        {
            id: 'event4-1',
            title: 'Web Dev Conference',
            description: 'A conference dedicated to the latest in web development, from modern CSS to server-side rendering.',
            date: '2024-09-25T09:00:00Z',
            location: 'Virtual Event',
            imageUrl: 'https://placehold.co/600x400.png',
            status: 'active',
            views: 5600,
            rsvps: 450,
        }
    ],
    offers: [],
    listings: [],
    posts: [
        {
        id: 'post4-1',
        content: "Thrilled to be speaking at the upcoming Web Dev Conference. My talk is on modern CSS techniques. Hope to see you there! #webdev #css #conference",
        imageUrl: "https://placehold.co/600x400.png",
        timestamp: "8h ago",
        likes: 98,
        comments: 15,
      }
    ],
    businesses: [],
  },
  {
    id: 'user5',
    uid: 'user5',
    name: 'Chris Lee',
    handle: 'chrisl',
    username: 'chrisl',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'CL',
    bio: "Startup founder and tech investor. Always looking for the next big thing in SaaS and AI.",
    following: [],
    subscribers: 25000,
    links: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
  {
    id: 'user6',
    uid: 'user6',
    name: 'Patricia Williams',
    handle: 'patriciaw',
    username: 'patriciaw',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'PW',
    bio: "Marketing strategist helping brands grow their online presence. Expert in SEO and content marketing.",
    following: [],
    subscribers: 4300,
    links: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
  {
    id: 'user7',
    uid: 'user7',
    name: 'Michael Brown',
    handle: 'mikeb',
    username: 'mikeb',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MB',
    bio: "Photographer and videographer. Capturing moments that tell a story. Based in New York.",
    following: [],
    subscribers: 15200,
    links: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
];
