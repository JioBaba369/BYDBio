
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

interface ClientFormattedDateProps {
  date: Date | string | Timestamp;
  formatStr?: 'PPP' | 'p' | 'PPP p' | 'MMM d' | 'MMM d, yyyy' | 'd MMMM yyyy';
  relative?: boolean;
  className?: string;
}

const getFormatOptions = (formatStr: ClientFormattedDateProps['formatStr']): Intl.DateTimeFormatOptions => {
    switch (formatStr) {
        case 'p': // time only
            return { hour: 'numeric', minute: 'numeric' };
        case 'PPP p': // full date and time
            return { dateStyle: 'medium', timeStyle: 'short' };
        case 'MMM d':
            return { month: 'short', day: 'numeric' };
        case 'MMM d, yyyy':
             return { month: 'short', day: 'numeric', year: 'numeric' };
        case 'd MMMM yyyy':
             return { day: 'numeric', month: 'long', year: 'numeric' };
        case 'PPP': // full date
        default:
            return { dateStyle: 'medium' };
    }
}

export function ClientFormattedDate({ date, formatStr = "PPP", relative = false, className }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState('...');
  
  useEffect(() => {
    try {
      if (!date) {
        setFormattedDate('...');
        return;
      }

      let dateObj: Date;

      if (typeof date === 'string') {
        dateObj = parseISO(date);
      } else if (date && typeof (date as Timestamp).toDate === 'function') {
        dateObj = (date as Timestamp).toDate();
      } else {
        dateObj = date as Date;
      }

      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date created from input: ${date}`);
      }
      
      if (relative) {
        setFormattedDate(formatDistanceToNow(dateObj, { addSuffix: true }));
      } else {
        const options = getFormatOptions(formatStr);
        setFormattedDate(new Intl.DateTimeFormat(navigator.language, options).format(dateObj));
      }
    } catch (error) {
        console.error("Error formatting date:", error);
        setFormattedDate("Invalid Date");
    }
  }, [date, formatStr, relative]);

  return <span className={className}>{formattedDate}</span>;
}
