import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | null | undefined): string {
  if (!value) return '';

  // Return non-numeric strings as is (e.g., "Free", "Contact for price")
  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g,""));
  if (isNaN(numericValue)) {
    return value;
  }

  // Use Intl.NumberFormat for robust currency formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericValue);
}
