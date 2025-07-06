
import { getAllOffers } from "@/lib/offers";
import OffersClient from "./offers-client";

export default async function OffersPage() {
  const offers = await getAllOffers();
  return <OffersClient initialOffers={offers} />;
}
