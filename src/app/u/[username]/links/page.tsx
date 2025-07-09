
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. It now redirects to the main user profile page
// where the links are displayed in the "About" tab.
export default function LinksRedirectPage({ params }: { params: { username: string } }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/u/${params.username}?tab=about`);
  }, [router, params.username]);

  return null; // Render nothing while redirecting
}
