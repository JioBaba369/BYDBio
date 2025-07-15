
import { getAllPublicContent } from '@/lib/users';
import ExploreClient from './explore-client';

export default async function ExplorePage() {
  const items = await getAllPublicContent();
  return <ExploreClient initialItems={items} />;
}
