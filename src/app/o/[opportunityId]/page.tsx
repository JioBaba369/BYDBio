
import { redirect } from 'next/navigation'

export default function OldJobPage({ params }: { params: { opportunityId: string } }) {
  // This component acts as a permanent redirect from the old job URL structure
  // to the new, consolidated one under /opportunities.
  redirect(`/opportunities/${params.opportunityId}`)
}
