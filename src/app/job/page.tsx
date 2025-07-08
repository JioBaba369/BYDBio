
import { getAllJobs } from "@/lib/jobs";
import JobsClient from "./jobs-client";

export default async function JobsPage() {
  const jobs = await getAllJobs();
  return <JobsClient initialJobs={jobs} />;
}
