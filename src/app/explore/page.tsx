
import { getSuggestedUsers } from "@/lib/users";
import ExploreClient from './explore-client';

export default async function ExplorePage() {
    // Fetch a larger list of users for the directory
    const initialUsers = await getSuggestedUsers("", 50);

    return (
        <ExploreClient initialUsers={initialUsers} />
    );
}
