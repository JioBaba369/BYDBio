
'use client';

import { useState, useEffect } from 'react';

/**
 * A client component to safely render the current year, preventing hydration mismatches.
 */
export function ClientYear() {
  const [year, setYear] = useState<number | null>(null);
  
  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setYear(new Date().getFullYear());
  }, []);

  // On the initial server render and the first client render, 'year' will be null.
  // We render an empty span to avoid a hydration mismatch.
  // The correct year will be filled in by the useEffect hook on the client.
  return <span>{year}</span>;
}
