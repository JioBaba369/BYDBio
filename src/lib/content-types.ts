
import { Gift, Briefcase, Tags, Megaphone, Calendar, Users, MousePointerClick } from 'lucide-react';
import type { CalendarItem } from './events';

export type ContentTypeMetadata = {
  name: string;
  label: string;
  icon: React.ElementType;
  getStatsValue: (item: CalendarItem) => number;
  getInteractionLabel: (type: string) => string;
};

export const CONTENT_TYPES: ContentTypeMetadata[] = [
    { 
        name: 'Event', 
        label: 'Events', 
        icon: Calendar,
        getStatsValue: (item) => item.rsvps?.length || 0,
        getInteractionLabel: () => 'RSVPs'
    },
    { 
        name: 'Offer', 
        label: 'Offers', 
        icon: Gift,
        getStatsValue: (item) => item.claims || 0,
        getInteractionLabel: () => 'Claims'
    },
    { 
        name: 'Job', 
        label: 'Jobs', 
        icon: Briefcase,
        getStatsValue: (item) => item.applicants || 0,
        getInteractionLabel: () => 'Applicants'
    },
    { 
        name: 'Listing', 
        label: 'Listings', 
        icon: Tags,
        getStatsValue: (item) => item.clicks || 0,
        getInteractionLabel: () => 'Clicks'
    },
    { 
        name: 'Business Page', 
        label: 'Business Pages', 
        icon: Megaphone,
        getStatsValue: (item) => item.clicks || 0,
        getInteractionLabel: () => 'Clicks'
    },
    { 
        name: 'Appointment', 
        label: 'Appointments', 
        icon: Users,
        getStatsValue: () => 0, // No specific stat for appointments
        getInteractionLabel: () => 'Booked'
    },
];

const contentTypeMap = new Map(CONTENT_TYPES.map(ct => [ct.name, ct]));

export const getContentTypeMetadata = (type: string): ContentTypeMetadata | undefined => {
    return contentTypeMap.get(type);
};
