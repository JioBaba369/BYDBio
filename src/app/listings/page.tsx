
import { getAllListings } from '@/lib/listings';
import ListingsClient from './listings-client';

export default async function ListingsPage() {
  const listings = await getAllListings();
  return <ListingsClient initialListings={listings} />;
}
