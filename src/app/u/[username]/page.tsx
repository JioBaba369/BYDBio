
import type { Metadata } from 'next';
import { getUserProfileData } from '@/lib/users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cookies } from 'next/headers';
import type { auth as adminAuth } from 'firebase-admin';
import UserProfileClientPage from './user-profile-client';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const data = await getUserProfileData(params.username, null);

  if (!data?.user) {
    return {
      title: 'User Not Found | BYD.Bio',
      description: "The profile you are looking for does not exist.",
    };
  }
  const { user } = data;

  return {
    title: `${user.name} | BYD.Bio`,
    description: user.bio,
    openGraph: {
      title: `${user.name} | BYD.Bio`,
      description: user.bio,
      images: [{ url: user.avatarUrl, width: 200, height: 200, alt: user.name }],
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
    const sessionCookie = cookies().get('session')?.value || '';
    let viewerId: string | null = null;
    
    // Conditionally import and use firebase-admin only if credentials are set
    if (process.env.FIREBASE_PRIVATE_KEY) {
        try {
            const { auth } = (await import('@/lib/firebase-admin')) as { auth: typeof adminAuth };
            const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
            viewerId = decodedClaims.uid;
        } catch (error) {
            // Session cookie is invalid, expired, or admin SDK failed to initialize.
            // In any case, the user is not authenticated on the server.
            viewerId = null;
        }
    }


    const userProfileData = await getUserProfileData(params.username, viewerId);

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

    return <UserProfileClientPage userProfileData={userProfileData} viewerId={viewerId} />;
}
