
import { getUserByUsername } from "@/lib/users";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LinksClientPage from "./links-client";

export default async function LinksPage({ params }: { params: { username: string } }) {
  const username = params.username;
  const user = await getUserByUsername(username);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-4xl font-bold">User Not Found</h1>
            <p className="text-muted-foreground mt-2">The profile you're looking for doesn't exist.</p>
             <Button asChild className="mt-6">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    )
  }

  return <LinksClientPage user={user} />;
}
