import { redirect } from 'next/navigation';

// This page redirects legacy /o/[jobId] URLs to the correct /opportunities/[jobId] path.
export default function OldJobRedirectPage({ params }: { params: { jobId: string } }) {
  redirect(`/opportunities/${params.jobId}`);
}
