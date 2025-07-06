
import { getAllJobs } from "@/lib/jobs";
import OpportunitiesClient from "./opportunities-client";

export default async function JobsPage() {
  const jobs = await getAllJobs();
  return <OpportunitiesClient initialJobs={jobs} />;
}
