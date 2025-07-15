
import { Gift, Briefcase, Tags, Megaphone, Calendar, Users, MousePointerClick } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import type { CalendarItem } from './events';

export type ContentTypeMetadata = {
  name: string;
  label: string;
  icon: React.ElementType;
  variant: VariantProps<typeof badgeVariants>['variant'];
  getStatsValue: (item: CalendarItem) => number;
  getInteractionLabel: (type: string) => string;
};

export const CONTENT_TYPES: ContentTypeMetadata[] = [
    { 
        name: 'Event', 
        label: 'Events', 
        icon: Calendar,
        variant: 'default',
        getStatsValue: (item) => item.rsvps?.length || 0,
        getInteractionLabel: () => 'RSVPs'
    },
    { 
        name: 'Offer', 
        label: 'Offers', 
        icon: Gift,
        variant: 'secondary',
        getStatsValue: (item) => item.claims || 0,
        getInteractionLabel: () => 'Claims'
    },
    { 
        name: 'Job', 
        label: 'Jobs', 
        icon: Briefcase,
        variant: 'destructive',
        getStatsValue: (item) => item.applicants || 0,
        getInteractionLabel: () => 'Applicants'
    },
    { 
        name: 'Listing', 
        label: 'Listings', 
        icon: Tags,
        variant: 'outline',
        getStatsValue: (item) => item.clicks || 0,
        getInteractionLabel: () => 'Clicks'
    },
    { 
        name: 'Business Page', 
        label: 'Business Pages', 
        icon: Megaphone,
        variant: 'default',
        getStatsValue: (item) => item.clicks || 0,
        getInteractionLabel: () => 'Clicks'
    },
    { 
        name: 'Appointment', 
        label: 'Appointments', 
        icon: Users,
        variant: 'secondary',
        getStatsValue: () => 0, // No specific stat for appointments
        getInteractionLabel: () => 'Booked'
    },
];

const contentTypeMap = new Map(CONTENT_TYPES.map(ct => [ct.name, ct]));

export const getContentTypeMetadata = (type: string): ContentTypeMetadata | undefined => {
    return contentTypeMap.get(type);
};
