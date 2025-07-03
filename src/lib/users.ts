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
  offers: { title: string; description: string; category: string }[];
  listings: Listing[];
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
        { title: 'Design Thinking Workshop', date: '2024-08-15', location: 'Online' },
    ],
    offers: [
        { title: '1-on-1 Portfolio Review', description: 'Get expert feedback on your design portfolio.', category: 'Consulting' },
    ],
    listings: [
        { id: 'listing1', title: 'Minimalist Icon Set', description: 'A pack of 200+ clean, modern icons for your next project.', price: '$25', imageUrl: 'https://placehold.co/600x400.png', category: 'Digital Asset' },
        { id: 'listing2', title: 'Web Design Masterclass', description: 'A 10-hour video course on modern web design principles.', price: '$149', imageUrl: 'https://placehold.co/600x400.png', category: 'Education' },
    ],
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
  },
];
