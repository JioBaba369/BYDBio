// In a real app, this data would come from a database.
// It's defined here for demonstration purposes.

type Listing = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
};

export type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  timestamp: string;
  likes: number;
  comments: number;
};

type Offer = {
  title: string;
  description: string;
  category: string;
  releaseDate: string;
};

type User = {
  id: string;
  name: string;
  handle: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  following: string[]; // Array of user IDs this user follows
  jobs: { title: string; company: string; location: string; type: string }[];
  events: { title: string; date: string; location: string }[];
  offers: Offer[];
  listings: Listing[];
  posts: Post[];
};

export const allUsers: User[] = [
  {
    id: 'user1',
    name: 'Jane Doe',
    handle: 'janedoe',
    username: 'janedoe',
    avatarUrl: 'https://placehold.co/200x200.png',
    avatarFallback: 'JD',
    following: ['user2', 'user4', 'user5'],
    jobs: [
       { title: 'UX/UI Designer', company: 'Creative Solutions', location: 'Remote', type: 'Full-time' },
    ],
    events: [
        { title: 'Design Thinking Workshop', date: '2024-08-15T14:00:00Z', location: 'Online' },
    ],
    offers: [
        { title: '1-on-1 Portfolio Review', description: 'Get expert feedback on your design portfolio.', category: 'Consulting', releaseDate: '2024-09-01T10:00:00Z' },
        { title: 'Early-Bird Discount: Web Design Course', description: 'Get 20% off my upcoming masterclass.', category: 'Discount', releaseDate: '2024-09-10T00:00:00Z' },
    ],
    listings: [
        { id: 'listing1', title: 'Minimalist Icon Set', description: 'A pack of 200+ clean, modern icons for your next project.', price: '$25', imageUrl: 'https://placehold.co/600x400.png', category: 'Digital Asset' },
        { id: 'listing2', title: 'Web Design Masterclass', description: 'A 10-hour video course on modern web design principles.', price: '$149', imageUrl: 'https://placehold.co/600x400.png', category: 'Education' },
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
    ]
  },
  {
    id: 'user2',
    name: 'John Smith',
    handle: 'johnsmith',
    username: 'johnsmith',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'JS',
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
    ]
  },
  {
    id: 'user3',
    name: 'Alex Johnson',
    handle: 'alexj',
    username: 'alexj',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'AJ',
    following: ['user1'],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
  },
  {
    id: 'user4',
    name: 'Maria Garcia',
    handle: 'mariag',
    username: 'mariag',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MG',
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
  },
  {
    id: 'user5',
    name: 'Chris Lee',
    handle: 'chrisl',
    username: 'chrisl',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'CL',
    following: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
  },
  {
    id: 'user6',
    name: 'Patricia Williams',
    handle: 'patriciaw',
    username: 'patriciaw',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'PW',
    following: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
  },
  {
    id: 'user7',
    name: 'Michael Brown',
    handle: 'mikeb',
    username: 'mikeb',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MB',
    following: [],
    jobs: [],
    events: [],
    offers: [],
    listings: [],
    posts: [],
  },
];
