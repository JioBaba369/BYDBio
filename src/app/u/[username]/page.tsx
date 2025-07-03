import type { Metadata } from 'next';
import { allUsers } from '@/lib/users';
import UserProfilePage from './user-profile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const username = params.username;
  const user = allUsers.find((u) => u.username === username);

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

export default function PublicProfilePageWrapper({ params }: { params: { username: string } }) {
    const username = params.username;
    const userProfileData = allUsers.find(u => u.username === username);

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

    return <UserProfilePage userProfileData={userProfileData} />;
}
