
import type { Metadata } from 'next';
import { getUserByUsername } from '@/lib/users';
import UserProfilePage from './user-profile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getPostsByUser, populatePostAuthors } from '@/lib/posts';
import { getListingsByUser } from '@/lib/listings';
import { getJobsByUser } from '@/lib/jobs';
import { getEventsByUser } from '@/lib/events';
import { getOffersByUser } from '@/lib/offers';
import { getPromoPagesByUser } from '@/lib/promo-pages';
import type { Timestamp } from 'firebase/firestore';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const username = params.username;
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      title: 'User Not Found | BYD.Bio',
      description: "The profile you are looking for does not exist.",
    };
  }

  return {
    title: `${user.name} | BYD.Bio`,
    description: user.bio,
    openGraph: {
      title: `${user.name} | BYD.Bio`,
      description: user.bio,
      images: [
        {
          url: user.avatarUrl,
          width: 200,
          height: 200,
          alt: user.name,
        },
      ],
      url: `/u/${user.username}`,
      type: 'profile',
      profile: {
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' '),
        username: user.username,
      }
    },
    twitter: {
      card: 'summary',
      title: `${user.name} | BYD.Bio`,
      description: user.bio,
      images: [user.avatarUrl],
    },
  };
}

export default async function PublicProfilePageWrapper({ params }: { params: { username: string } }) {
    const username = params.username;
    const userProfileData = await getUserByUsername(username);

    if (!userProfileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <Card className="p-8">
                    <CardContent className="p-0">
                        <h1 className="text-4xl font-bold">User Not Found</h1>
                        <p className="text-muted-foreground mt-2">The profile you're looking for doesn't exist.</p>
                        <Button asChild className="mt-6">
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Fetch all content related to the user in parallel
    const [rawPosts, listings, jobs, events, offers, promoPages] = await Promise.all([
        getPostsByUser(userProfileData.uid),
        getListingsByUser(userProfileData.uid),
        getJobsByUser(userProfileData.uid),
        getEventsByUser(userProfileData.uid),
        getOffersByUser(userProfileData.uid),
        getPromoPagesByUser(userProfileData.uid)
    ]);
    
    // Now populate the posts with author info
    const posts = await populatePostAuthors(rawPosts);
    
    // Serialize date objects before passing to client component
    const content = {
        posts: posts,
        listings: listings.map(l => ({ ...l, createdAt: (l.createdAt as Timestamp).toDate().toISOString(), startDate: l.startDate ? (l.startDate as Date).toISOString() : null, endDate: l.endDate ? (l.endDate as Date).toISOString() : null })),
        jobs: jobs.map(j => ({ ...j, postingDate: (j.postingDate as Date).toISOString(), createdAt: (j.createdAt as Timestamp).toDate().toISOString(), startDate: j.startDate ? (j.startDate as Date).toISOString() : null, endDate: j.endDate ? (j.endDate as Date).toISOString() : null })),
        events: events.map(e => ({ ...e, startDate: (e.startDate as Date).toISOString(), endDate: e.endDate ? (e.endDate as Date).toISOString() : null, createdAt: (e.createdAt as Timestamp).toDate().toISOString() })),
        offers: offers.map(o => ({ ...o, startDate: (o.startDate as Date).toISOString(), endDate: o.endDate ? (o.endDate as Date).toISOString() : null, createdAt: (o.createdAt as Timestamp).toDate().toISOString() })),
        promoPages: promoPages.map(p => ({ ...p, createdAt: (p.createdAt as Timestamp).toDate().toISOString() })),
    };

    return <UserProfilePage userProfileData={userProfileData} content={content} />;
}
