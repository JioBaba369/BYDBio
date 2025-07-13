
import { z } from 'zod';
import type { BookingSettings as UserBookingSettings } from '@/lib/users';

// --- Re-export types to be used in components ---
export type BookingSettings = UserBookingSettings;

// --- Schemas ---
const publicProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(50, "Name cannot be longer than 50 characters."),
  username: z.string()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters long.")
    .max(30, "Username cannot be longer than 30 characters.")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores."),
  bio: z.string().max(160, "Bio must be 160 characters or less.").optional(),
  avatarUrl: z.string().url().optional(),
  hashtags: z.array(z.string()).max(10, "You can add up to 10 hashtags.").optional(),
});

const businessCardSchema = z.object({
  title: z.string().max(50, "Title cannot be longer than 50 characters.").optional(),
  company: z.string().max(50, "Company cannot be longer than 50 characters.").optional(),
  phone: z.string().max(30, "Phone number cannot be longer than 30 characters.").optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  location: z.string().max(100, "Location cannot be longer than 100 characters.").optional(),
});

const linksFormSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().optional(),
      icon: z.string(),
      title: z.string().min(1, "Title cannot be empty.").max(50, "Title must be 50 characters or less."),
      url: z.string().url("Please enter a valid URL."),
    })
  ),
});

const bookingSettingsSchema = z.object({
  acceptingAppointments: z.boolean().default(false),
  availability: z.object({
    sunday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    monday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    tuesday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    wednesday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    thursday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    friday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    saturday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
  }),
});

// --- Unified Schema for the form ---
export const profileSchema = publicProfileSchema.extend({
  businessCard: businessCardSchema,
  links: linksFormSchema.shape.links,
  bookingSettings: bookingSettingsSchema,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
