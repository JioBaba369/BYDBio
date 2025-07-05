'use server';

/**
 * @fileOverview A service for fetching public holiday data.
 *
 * - getPublicHolidays - Fetches public holidays for a given year and country.
 */

import { z } from 'zod';

const NagerDateHolidaySchema = z.object({
  date: z.string(),
  localName: z.string(),
  name: z.string(),
  countryCode: z.string(),
  fixed: z.boolean(),
  global: z.boolean(),
  counties: z.array(z.string()).nullable(),
  launchYear: z.number().nullable(),
  types: z.array(z.string()),
});

type NagerDateHoliday = z.infer<typeof NagerDateHolidaySchema>;

const HolidaySchema = z.object({
  name: z.string().describe('The name of the public holiday.'),
  date: z.string().describe('The date of the holiday in YYYY-MM-DD format.'),
});

type Holiday = z.infer<typeof HolidaySchema>;

export async function getPublicHolidays(
  year: number,
  countryCode: string
): Promise<Holiday[]> {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    }

    const holidays: NagerDateHoliday[] = await response.json();

    return holidays.map((holiday) => ({
      name: holiday.name,
      date: holiday.date,
    }));
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    throw new Error('Could not retrieve holiday information.');
  }
}
