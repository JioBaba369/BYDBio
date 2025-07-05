
import type { Metadata } from 'next';
import { getJobAndAuthor } from '@/lib/jobs';
import OpportunityDetailClient from './opportunity-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { User } from '@/lib/users';
import type { Job } from '@/lib/jobs';
import type { Timestamp } from 'firebase/firestore';

export async function generateMetadata({ params }: { params: { opportunityId: string } }): Promise<Metadata> {
  const data = await getJobAndAuthor(params.opportunityId);

  if (!data) {
    return {
      title: 'Opportunity Not Found | BYD.Bio',
      description: "The opportunity you're looking for doesn't exist.",
    };
  }

  const { job } = data;
  const imageUrl = job.imageUrl || 'https://placehold.co/1200x630.png';

  return {
    title: `${job.title} at ${job.company} | BYD.Bio`,
    description: job.description || `Apply for the ${job.type} ${job.title} role at ${job.company}. Located in ${job.location}.`,
    openGraph: {
      title: `${job.title} at ${job.company} | BYD.Bio`,
      description: job.description || `Apply for the ${job.type} ${job.title} role at ${job.company}.`,
      images: [ { url: imageUrl, width: 1200, height: 630, alt: job.title } ],
      url: `/o/${job.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${job.title} at ${job.company} | BYD.Bio`,
      description: job.description || `Apply for the ${job.type} ${job.title} role at ${job.company}.`,
      images: [imageUrl],
    },
  };
}


export default async function PublicOpportunityPage({ params }: { params: { opportunityId: string } }) {
    const data = await getJobAndAuthor(params.opportunityId);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Opportunity Not Found</h1>
                <p className="text-muted-foreground mt-2">The job opportunity you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/explore">Back to Explore</Link>
                </Button>
            </div>
        )
    }

    const serializableJob = {
        ...data.job,
        postingDate: (data.job.postingDate as Date).toISOString(),
        closingDate: data.job.closingDate ? (data.job.closingDate as Date).toISOString() : null,
        startDate: data.job.startDate ? (data.job.startDate as Date).toISOString() : null,
        endDate: data.job.endDate ? (data.job.endDate as Date).toISOString() : null,
        createdAt: (data.job.createdAt as Timestamp).toDate().toISOString(),
    };

    return <OpportunityDetailClient job={serializableJob} author={data.author} />;
}
