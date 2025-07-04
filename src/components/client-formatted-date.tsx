
'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

interface ClientFormattedDateProps {
  date: Date | string | Timestamp;
  formatStr?: string;
  relative?: boolean;
  className?: string;
}

export function ClientFormattedDate({ date, formatStr = "PPP", relative = false, className }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState('...');
  
  useEffect(() => {
    // This effect runs only on the client, after the initial render, to prevent hydration errors.
    try {
      if (!date) {
        setFormattedDate('...');
        return;
      }

      let dateObj: Date;

      if (typeof date === 'string') {
        dateObj = parseISO(date);
      } else if (date && typeof (date as Timestamp).toDate === 'function') {
        // Duck-typing for Firestore Timestamp to avoid runtime import issues.
        dateObj = (date as Timestamp).toDate();
      } else {
        dateObj = date as Date;
      }

      // Final check for a valid Date object before formatting
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date created from input: ${date}`);
      }
      
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
