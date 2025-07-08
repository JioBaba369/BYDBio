
'use client';

import { useState, useEffect } from 'react';

interface ClientFormattedCurrencyProps {
  value: string | number | null | undefined;
  currency?: string; // e.g., 'USD', 'EUR'
  className?: string;
}

export function ClientFormattedCurrency({ value, currency = 'USD', className }: ClientFormattedCurrencyProps) {
  const [formattedValue, setFormattedValue] = useState('...');

  useEffect(() => {
    if (value === null || value === undefined) {
      setFormattedValue('');
      return;
    }

    let stringValue = typeof value === 'number' ? value.toString() : value;

    // Check if the value can be parsed as a number
    const numericValue = parseFloat(stringValue.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericValue)) {
      // If not a number, display the original string (e.g., "Free", "Contact for price")
      setFormattedValue(stringValue);
      return;
    }

    // Use Intl.NumberFormat for robust, locale-aware currency formatting
    try {
      const formatted = new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currency,
      }).format(numericValue);
      setFormattedValue(formatted);
    } catch (error) {
      // Fallback for invalid currency code or other errors
      console.error("Error formatting currency:", error);
      setFormattedValue(`$${numericValue.toFixed(2)}`);
    }

  }, [value, currency]);

  return <span className={className}>{formattedValue}</span>;
}
