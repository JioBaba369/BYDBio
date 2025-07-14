import { z } from 'zod';
// Import the base BookingSettings type from your users library
import type { BookingSettings as UserBookingSettings } from '@/lib/users';

// --- Re-export types for component usage ---

/**
 * Re-exports the BookingSettings type from the users library for consistent use across components.
 */
export type BookingSettings = UserBookingSettings;

// --- Schemas ---

/**
 * Defines the schema for the public-facing aspects of a user's profile.
 */
const publicProfileSchema = z.object({
  /**
   * The user's display name. Must be between 1 and 50 characters.
   */
  name: z.string()
    .trim() // Remove leading/trailing whitespace
    .min(1, "Name cannot be empty.")
    .max(50, "Name cannot be longer than 50 characters."),

  /**
   * The user's unique username. Must be lowercase, alphanumeric with underscores,
   * and between 3 and 30 characters.
   */
  username: z.string()
    .toLowerCase()
    .trim() // Remove leading/trailing whitespace
    .min(3, "Username must be at least 3 characters long.")
    .max(30, "Username cannot be longer than 30 characters.")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores."),

  /**
   * A short biography for the user. Optional, but max 160 characters.
   */
  bio: z.string().max(160, "Bio must be 160 characters or less.").optional(),

  /**
   * URL to the user's avatar image. Optional, must be a valid URL if present.
   */
  avatarUrl: z.string().url("Please enter a valid URL for the avatar.").optional(),

  /**
   * An array of hashtags associated with the user's profile. Optional, max 10 hashtags.
   */
  hashtags: z.array(z.string().trim().min(1, "Hashtag cannot be empty.")).max(10, "You can add up to 10 hashtags.").optional(),
});

/**
 * Defines the schema for a user's digital business card information.
 */
const businessCardSchema = z.object({
  /**
   * Job title or role. Optional, max 50 characters.
   */
  title: z.string().trim().max(50, "Title cannot be longer than 50 characters.").optional(),

  /**
   * Company name. Optional, max 50 characters.
   */
  company: z.string().trim().max(50, "Company cannot be longer than 50 characters.").optional(),

  /**
   * Phone number. Optional, max 30 characters.
   */
  phone: z.string().trim().max(30, "Phone number cannot be longer than 30 characters.").optional(),

  /**
   * Email address. Optional, must be a valid email if present.
   * Handles empty string as a valid optional state.
   */
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal('')),

  /**
   * Website URL. Optional, must be a valid URL if present.
   * Handles empty string as a valid optional state.
   */
  website: z.string().url("Please enter a valid URL for the website.").optional().or(z.literal('')),

  /**
   * LinkedIn profile URL. Optional, must be a valid URL if present.
   * Handles empty string as a valid optional state.
   */
  linkedin: z.string().url("Please enter a valid URL for LinkedIn.").optional().or(z.literal('')),

  /**
   * User's location. Optional, max 100 characters.
   */
  location: z.string().trim().max(100, "Location cannot be longer than 100 characters.").optional(),
});

/**
 * Defines the schema for a list of external links associated with the user.
 */
const linksFormSchema = z.object({
  /**
   * An array of link objects. Each link requires an icon, title, and URL.
   * The 'id' field is for internal form management (e.g., react-hook-form dnd) and is optional for validation.
   */
  links: z.array(
    z.object({
      id: z.string().optional(), // Used for DND, not part of actual data storage usually
      icon: z.string().min(1, "Icon is required.").max(50, "Icon name too long."), // Assuming this is an icon identifier string
      title: z.string().trim().min(1, "Title cannot be empty.").max(50, "Title must be 50 characters or less."),
      url: z.string().url("Please enter a valid URL for the link."),
    })
  ).max(10, "You can add up to 10 links."), // Added a max limit for links, adjust as needed
});

/**
 * Defines the schema for a user's appointment booking settings.
 */
const bookingSettingsSchema = z.object({
  /**
   * Boolean indicating if the user is accepting appointments.
   */
  acceptingAppointments: z.boolean().default(false),

  /**
   * Availability settings for each day of the week.
   */
  availability: z.object({
    sunday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    monday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    tuesday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    wednesday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    thursday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    friday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    saturday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
  }).describe("Weekly availability for appointments, including start and end times."), // Added description
});

// --- Unified Schema for the profile form ---

/**
 * The main Zod schema combining all profile-related form values.
 * This schema is used for comprehensive validation of the entire profile form.
 */
export const profileSchema = publicProfileSchema.extend({
  businessCard: businessCardSchema,
  // Directly use the array type from linksFormSchema.shape.links
  links: linksFormSchema.shape.links,
  bookingSettings: bookingSettingsSchema,
});

/**
 * Infers the TypeScript type from the `profileSchema` for use in React components
 * and other parts of the application.
 */
export type ProfileFormValues = z.infer<typeof profileSchema>;