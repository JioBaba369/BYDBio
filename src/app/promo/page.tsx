
import { getAllPromoPages } from "@/lib/promo-pages";
import PromoClient from "./promo-client";

export default async function PromoPagesPage() {
  const promoPages = await getAllPromoPages();
  return <PromoClient initialPromoPages={promoPages} />;
}
