'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
            <Scale /> Terms & Conditions
        </CardTitle>
        <CardDescription>
            Last Updated: <time dateTime="2024-07-21">July 21, 2024</time>
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-6 prose dark:prose-invert max-w-none">
            <p>Welcome to BYD.Bio! These terms and conditions outline the rules and regulations for the use of BYD.Bio's Website, located at byd.bio.</p>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use BYD.Bio if you do not agree to take all of the terms and conditions stated on this page.</p>
            
            <h2>1. Accounts</h2>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

            <h2>2. Content</h2>
            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>

            <h2>3. Intellectual Property</h2>
            <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of BYD.Bio and its licensors.</p>
            
            <p>[This is a placeholder document. Replace with your full Terms & Conditions.]</p>
        </CardContent>
      </Card>
    </div>
  );
}
