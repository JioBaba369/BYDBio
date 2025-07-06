
import { getAllPublicContent } from '@/lib/content';
import ExploreClient from './explore-client';

export default async function ExplorePage() {
    const initialContent = await getAllPublicContent();

    return (
        <ExploreClient initialItems={initialContent} />
    );
}
