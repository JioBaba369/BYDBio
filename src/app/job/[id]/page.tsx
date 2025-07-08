
import type { Metadata } from 'next';
import { getJobAndAuthor } from '@/lib/jobs';
import OpportunityDetailClient from './client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getJobAndAuthor(params.id);

  if (!data) {
    return {
      title: 'Job Not Found | BYD.Bio',
      description: "The job you're looking for doesn't exist.",
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
      url: `/job/${job.id}`,
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


export default async function PublicJobPage({ params }: { params: { id: string } }) {
    const data = await getJobAndAuthor(params.id);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Job Not Found</h1>
                <p className="text-muted-foreground mt-2">The job opportunity you're looking for doesn't exist or has been filled.</p>
                <Button asChild className="mt-6">
                    <Link href="/explore">Back to Explore</Link>
                </Button>
            </div>
        )
    }

    return <OpportunityDetailClient job={data.job} author={data.author} />;
}
