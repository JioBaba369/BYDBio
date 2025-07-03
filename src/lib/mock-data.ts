import { Globe, Linkedin, Github, Twitter } from "lucide-react";

export const currentUser = {
  name: "Jane Doe",
  username: "janedoe",
  email: "jane.doe@example.com",
  avatarUrl: "https://placehold.co/200x200.png",
  avatarFallback: "JD",
  bio: "Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs. Passionate about design systems and accessibility.",
  subscribers: "12.5k",
  links: [
    { title: "Personal Website", url: "https://janedoe.design", icon: Globe },
    { title: "LinkedIn", url: "https://linkedin.com/in/janedoe", icon: Linkedin },
    { title: "GitHub", url: "https://github.com/janedoe", icon: Github },
    { title: "Twitter / X", url: "https://x.com/janedoe", icon: Twitter },
  ],
  jobs: [],
  events: [],
  offers: [],
  businessCard: {
    title: "Senior Product Designer",
    company: "Acme Inc.",
    phone: "+1 (555) 123-4567",
    email: "jane.doe@acme.com",
    website: "janedoe.design",
    linkedin: "linkedin.com/in/janedoe",
    location: "San Francisco, CA",
  }
};
