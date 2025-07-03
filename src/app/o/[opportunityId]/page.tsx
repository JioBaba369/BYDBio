import type { Metadata } from 'next';
import { allUsers, type User, type Job } from '@/lib/users';
import OpportunityDetailClient from './opportunity-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper to find job and its author
function findJobAndAuthor(jobId: string): { job: Job; author: User } | null {
    for (const user of allUsers) {
        const job = user.jobs.find(j => j.id === jobId);
        if (job) {
            return { job, author: user };
        }
    }
    return null;
}

export async function generateMetadata({ params }: { params: { opportunityId: string } }): Promise<Metadata> {
  const data = findJobAndAuthor(params.opportunityId);

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
    description: `Apply for the ${job.type} ${job.title} role at ${job.company}. Located in ${job.location}.`,
    openGraph: {
      title: `${job.title} at ${job.company} | BYD.Bio`,
      description: `Apply for the ${job.type} ${job.title} role at ${job.company}.`,
      images: [ { url: imageUrl, width: 1200, height: 630, alt: job.title } ],
      url: `/o/${job.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${job.title} at ${job.company} | BYD.Bio`,
      description: `Apply for the ${job.type} ${job.title} role at ${job.company}.`,
      images: [imageUrl],
    },
  };
}


export default function PublicOpportunityPage({ params }: { params: { opportunityId: string } }) {
    const data = findJobAndAuthor(params.opportunityId);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Opportunity Not Found</h1>
                <p className="text-muted-foreground mt-2">The job opportunity you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/opportunities">Back to Opportunities</Link>
                </Button>
            </div>
        )
    }

    return <OpportunityDetailClient job={data.job} author={data.author} />;
}
