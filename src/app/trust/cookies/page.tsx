'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookieNoticePage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
            <Cookie /> Cookie Notice
        </CardTitle>
        <CardDescription>
            Last Updated: <time dateTime="2024-07-21">July 21, 2024</time>
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-6 prose dark:prose-invert max-w-none">
            <h2>What Are Cookies</h2>
            <p>As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.</p>
            
            <h2>How We Use Cookies</h2>
            <p>We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.</p>
            <ul>
                <li><strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.</li>
                <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</li>
            </ul>

            <p>[This is a placeholder document. Replace with your full Cookie Notice.]</p>
        </CardContent>
      </Card>
    </div>
  );
}
