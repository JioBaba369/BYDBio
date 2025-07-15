
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Handshake } from "lucide-react";

export default function PrivacyNoticePage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
            <Handshake /> Privacy Notice
        </CardTitle>
        <CardDescription>
            Last Updated: <time dateTime="2024-07-21">July 21, 2024</time>
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-6 prose dark:prose-invert max-w-none">
            <p>Your privacy is important to us. It is BYD.Bio's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
            
            <h2>1. Information We Collect</h2>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul>
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
            </ul>

            <h2>3. Security</h2>
            <p>We are committed to protecting the security of your personal information. We use a variety of security technologies and procedures to help protect your personal information from unauthorized access, use, or disclosure.</p>

            <p>[This is a placeholder document. Replace with your full Privacy Notice.]</p>
        </CardContent>
      </Card>
    </div>
  );
}
