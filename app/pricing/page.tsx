import { fetchFaqs } from "@/lib/db";
import { PricingClient } from "./pricing-client";

export default async function PricingPage() {
  const faqs = await fetchFaqs();
  return <PricingClient faqs={faqs} />;
}
