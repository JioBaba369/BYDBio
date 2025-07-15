
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, LifeBuoy, BookUser, HelpCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

const supportTopics = [
    { href: "/support/getting-started", title: "Getting Started", description: "New to BYD.Bio? Start here to set up your profile and learn the basics.", icon: BookUser },
    { href: "/support/faqs", title: "Frequently Asked Questions", description: "Find answers to common questions about features, accounts, and more.", icon: HelpCircle },
    { href: "/support/report-a-violation", title: "Report a Violation", description: "Learn how to report content or users that violate our community guidelines.", icon: ShieldAlert },
];

export default function SupportPage() {
  return (
    <div className="space-y-8">
        <section className="text-center py-12 bg-muted/40 rounded-lg">
            <LifeBuoy className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl font-bold font-headline">Support Center</h1>
            <p className="mt-2 text-lg text-muted-foreground">How can we help you today?</p>
            <div className="mt-6 relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search help articles..." className="pl-10 h-12 text-lg" />
            </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportTopics.map(topic => (
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
