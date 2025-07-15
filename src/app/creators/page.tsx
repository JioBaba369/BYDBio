
import { getSuggestedUsers } from "@/lib/users";
import CreatorsClient from './creators-client';

export default async function CreatorsPage() {
    // Fetch a larger list of users for the directory
    const initialUsers = await getSuggestedUsers("", 50);

    return (
        <CreatorsClient initialUsers={initialUsers} />
    );
}
