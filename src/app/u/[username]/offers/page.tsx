
'use client';
// This page is obsolete and has been replaced by the new unified profile page.
// The content is now displayed in a tab on /u/[username].
// This file can be deleted.

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DeprecatedUserOffersPage() {
  const router = useRouter();
  const params = useParams();
  const username = typeof params.username === 'string' ? params.username : '';

  useEffect(() => {
    if (username) {
      router.replace(`/u/${username}#offers`);
    } else {
      router.replace('/');
    }
  }, [router, username]);

  return null;
}
