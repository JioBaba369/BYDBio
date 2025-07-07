
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

  if (!year) {
    // Return a placeholder or the server-rendered value if needed,
    // though it's safer to wait for the client-side value.
    return <span>{new Date().getFullYear()}</span>;
  }

  return <span>{year}</span>;
}
