import { fetchBreakdowns } from "@/lib/db";
import { BreakdownsClient } from "./breakdowns-client";

export default async function BreakdownsPage() {
  const breakdowns = await fetchBreakdowns();
  return <BreakdownsClient breakdowns={breakdowns} />;
}
