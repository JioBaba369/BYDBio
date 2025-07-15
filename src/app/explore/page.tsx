
import { getAllPublicContent } from '@/lib/content';
import ExploreClient from './explore-client';

export default async function ExplorePage() {
  const items = await getAllPublicContent();
  return <ExploreClient initialItems={items} />;
}
