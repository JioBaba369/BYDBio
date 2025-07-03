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
  businessCard: {
    title: "Senior Product Designer",
    company: "Acme Inc.",
    phone: "+1 (555) 123-4567",
    email: "jane.doe@acme.com",
    website: "https://janedoe.design",
    linkedin: "https://www.linkedin.com/in/janedoe",
    location: "San Francisco, CA",
  },
};
