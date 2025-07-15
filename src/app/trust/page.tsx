
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Scale, Shield, Cookie, Handshake } from "lucide-react";

const trustTopics = [
    { href: "/trust/terms", title: "Terms & Conditions", description: "Our terms of service that govern your use of BYD.Bio.", icon: Scale },
    { href: "/trust/privacy", title: "Privacy Notice", description: "Learn how we collect, use, and protect your personal data.", icon: Handshake },
    { href: "/trust/cookies", title: "Cookie Notice", description: "Details about the cookies we use and why.", icon: Cookie },
];

export default function TrustCenterPage() {
  return (
    <div className="space-y-8">
        <section className="text-center py-12 bg-muted/40 rounded-lg">
            <Shield className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl font-bold font-headline">Trust Center</h1>
            <p className="mt-2 text-lg text-muted-foreground">Your trust is our top priority. Learn about our policies and commitment to your privacy and security.</p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustTopics.map(topic => (
                 <Link href={topic.href} key={topic.title} className="group block">
                    <Card className="h-full hover:border-primary transition-colors">
                        <CardHeader className="flex-row gap-4 items-center">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <topic.icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors">{topic.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{topic.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </section>
    </div>
  );
}
