import { allUsers } from "./users";

// This would be determined by authentication in a real app
const CURRENT_USER_ID = 'user1'; 

const fullCurrentUser = allUsers.find(u => u.id === CURRENT_USER_ID)!;

export const currentUser = {
  ...fullCurrentUser,
  email: "jane.doe@example.com",
  bio: "Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs. Passionate about design systems and accessibility.",
  subscribers: "12.5k", // This would be calculated in a real app
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
  businesses: [
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
  ],
  rsvpedEventIds: ['event4-1'],
};
