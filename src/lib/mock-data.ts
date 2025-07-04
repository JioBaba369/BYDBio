
import { allUsers, User, Business, Event } from "./users";

// This would be determined by authentication in a real app
const CURRENT_USER_ID = 'user1'; 

const fullCurrentUser = allUsers.find(u => u.id === CURRENT_USER_ID)!;

export const currentUser = {
  ...fullCurrentUser,
  email: "jiobaba369@gmail.com",
  rsvpedEventIds: ['event4-1'],
};
