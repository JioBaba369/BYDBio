'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Files } from "lucide-react";

export default function LawEnforcementPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
            <Files /> Law Enforcement Access Policy
        </CardTitle>
        <CardDescription>
            Our policy for responding to law enforcement and other government requests for user data.
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-6 prose dark:prose-invert max-w-none">
            <h2>Our Commitment to User Privacy</h2>
            <p>BYD.Bio is strongly committed to the privacy and security of our users' data. We do not voluntarily disclose user information to any government agency unless we are compelled by a legally valid and binding order, such as a subpoena, court order, or search warrant.</p>

            <h2>Review Process</h2>
            <p>Each request we receive is carefully reviewed by our legal team to ensure it complies with all applicable laws. We will attempt to narrow the scope of any request that we believe is overly broad or vague. We are prepared to challenge invalid requests in court.</p>
            
            <h2>User Notification</h2>
            <p>Unless prohibited by law or a court order, it is our policy to notify users of any request for their data before disclosure, giving them an opportunity to seek legal recourse.</p>

            <p>[This is a placeholder document. Replace with your full Law Enforcement Access Policy.]</p>
        </CardContent>
      </Card>
    </div>
  );
}
