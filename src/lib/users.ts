// In a real app, this data would come from a database.
// It's defined here for demonstration purposes.

type User = {
  id: string;
  name: string;
  handle: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  following: string[]; // Array of user IDs this user follows
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
  },
  {
    id: 'user2',
    name: 'John Smith',
    handle: 'johnsmith',
    username: 'johnsmith',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'JS',
    following: ['user1', 'user4'],
  },
  {
    id: 'user3',
    name: 'Alex Johnson',
    handle: 'alexj',
    username: 'alexj',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'AJ',
    following: ['user1'],
  },
  {
    id: 'user4',
    name: 'Maria Garcia',
    handle: 'mariag',
    username: 'mariag',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MG',
    following: ['user1', 'user2'],
  },
  {
    id: 'user5',
    name: 'Chris Lee',
    handle: 'chrisl',
    username: 'chrisl',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'CL',
    following: [],
  },
  {
    id: 'user6',
    name: 'Patricia Williams',
    handle: 'patriciaw',
    username: 'patriciaw',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'PW',
    following: [],
  },
  {
    id: 'user7',
    name: 'Michael Brown',
    handle: 'mikeb',
    username: 'mikeb',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarFallback: 'MB',
    following: [],
  },
];
