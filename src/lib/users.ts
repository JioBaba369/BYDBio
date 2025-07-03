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
};

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string | null;
  status: 'active' | 'archived';
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
};

type User = {
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
};

export const allUsers: User[] = [
  {
    id: 'user1',
    name: 'Jane Doe',
    handle: 'janedoe',
    username: 'janedoe',
    avatarUrl: 'https://placehold.co/200x200.png',
    avatarFallback: 'JD',
    bio: "Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs. Passionate about design systems and accessibility.",
    following: ['user2', 'user4', 'user5'],
    jobs: [
       { id: 'job1', title: 'UX/UI Designer', company: 'Creative Solutions', location: 'Remote', type: 'Full-time', postingDate: '2024-08-20T09:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'active' },
    ],
    events: [
        { id: 'event1', title: 'Design Thinking Workshop', date: '2024-08-15T14:00:00Z', location: 'Online', imageUrl: 'https://placehold.co/600x400.png', status: 'active' },
    ],
    offers: [
        { id: 'offer1', title: '1-on-1 Portfolio Review', description: 'Get expert feedback on your design portfolio.', category: 'Consulting', releaseDate: '2024-09-01T10:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'active' },
        { id: 'offer2', title: 'Early-Bird Discount: Web Design Course', description: 'Get 20% off my upcoming masterclass.', category: 'Discount', releaseDate: '2024-09-10T00:00:00Z', imageUrl: 'https://placehold.co/600x400.png', status: 'active' },
    ],
    listings: [
        { id: 'listing1', title: 'Minimalist Icon Set', description: 'A pack of 200+ clean, modern icons for your next project.', price: '$25', imageUrl: 'https://placehold.co/600x400.png', category: 'Digital Asset', publishDate: '2024-08-25T09:00:00Z', status: 'active' },
        { id: 'listing2', title: 'Web Design Masterclass', description: 'A 10-hour video course on modern web design principles.', price: '$149', imageUrl: 'https://placehold.co/600x400.png', category: 'Education', publishDate: '2024-08-10T09:00:00Z', status: 'active' },
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
    businesses: [],
  },
  {
    id: 'user2',
    name: 'John Smith',
    handle: 'johnsmith',
    username: 'johnsmith',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'JS',
    bio: "Writer and thought leader on the future of work. Exploring remote collaboration and productivity hacks.",
    following: ['user1', 'user4'],
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
    name: 'Alex Johnson',
    handle: 'alexj',
    username: 'alexj',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'AJ',
    bio: "Frontend developer passionate about building beautiful and accessible user interfaces with React and Next.js.",
    following: ['user1'],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
  {
    id: 'user4',
    name: 'Maria Garcia',
    handle: 'mariag',
    username: 'mariag',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MG',
    bio: "Web developer and CSS enthusiast. Speaker at Web Dev Conference. Sharing tips on modern web technologies.",
    following: ['user1', 'user2'],
    jobs: [],
    events: [],
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
    name: 'Chris Lee',
    handle: 'chrisl',
    username: 'chrisl',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'CL',
    bio: "Startup founder and tech investor. Always looking for the next big thing in SaaS and AI.",
    following: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
  {
    id: 'user6',
    name: 'Patricia Williams',
    handle: 'patriciaw',
    username: 'patriciaw',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'PW',
    bio: "Marketing strategist helping brands grow their online presence. Expert in SEO and content marketing.",
    following: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
  {
    id: 'user7',
    name: 'Michael Brown',
    handle: 'mikeb',
    username: 'mikeb',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MB',
    bio: "Photographer and videographer. Capturing moments that tell a story. Based in New York.",
    following: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
    businesses: [],
  },
];
