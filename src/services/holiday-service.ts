
'use server';

/**
 * @fileOverview A service for fetching public holiday data.
 *
 * - getPublicHolidays - Fetches public holidays for a given year and country.
 */

// These are now local types and are not exported.
type NagerDateHoliday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
};

type Holiday = {
  name: string;
  date: string;
  counties: string[] | null;
  isGlobal: boolean;
};

export async function getPublicHolidays(
  year: number,
  countryCode: string
): Promise<Holiday[]> {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
    );

    if (!response.ok) {
      // The API returns a 404 for invalid country codes.
      // We can provide a more helpful error message.
      if (response.status === 404) {
          throw new Error(`The country "${countryCode}" is not recognized by the holiday service. Please use a valid two-letter country code (e.g., US, GB, CA).`);
      }
      throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    }

    // Handle the case where there are no holidays for a given year/country.
    // The API returns a 204 No Content response in this case.
    if (response.status === 204) {
      return []; // Return an empty array, as there are no holidays.
    }

    const holidays: NagerDateHoliday[] = await response.json();

    return holidays.map((holiday) => ({
      name: holiday.name,
      date: holiday.date,
      counties: holiday.counties,
      isGlobal: holiday.global,
    }));
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    // Re-throw the error to be handled by the caller (the Genkit flow)
    if (error instanceof Error) {
        throw error;
    }
    // Fallback error
    throw new Error('An unknown error occurred while fetching holiday information.');
  }
}
