
'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

interface ClientFormattedDateProps {
  date: Date | string;
  formatStr?: string;
  relative?: boolean;
  className?: string;
}

export function ClientFormattedDate({ date, formatStr = "PPP", relative = false, className }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState('...');
  
  useEffect(() => {
    // This effect runs only on the client, after the initial render, to prevent hydration errors.
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (relative) {
        setFormattedDate(formatDistanceToNow(dateObj, { addSuffix: true }));
      } else {
        setFormattedDate(format(dateObj, formatStr));
      }
    } catch (error) {
        console.error("Error formatting date:", error);
        setFormattedDate("Invalid Date");
    }
  }, [date, formatStr, relative]);

  return <span className={className}>{formattedDate}</span>;
}
