
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "Is BYD.Bio free to use?",
        answer: "Yes, all core features of BYD.Bio are completely free. This includes creating your profile, adding links, and posting content. We plan to introduce an optional 'Pro' subscription in the future for advanced features like analytics and enhanced customization."
    },
    {
        question: "How do I change my username?",
        answer: "You can change your username from the 'Profile Editor' page. Please note that changing your username will also change your public profile URL. Make sure to update any links you have shared."
    },
    {
        question: "Can I make my profile private?",
        answer: "Currently, all user profiles are public to encourage networking and discovery. However, you have granular control over the privacy of your status updates, which can be set to 'Public', 'Followers only', or 'Me only'."
    },
    {
        question: "What is a BYD BioTAG?",
        answer: "The BYD BioTAG is a physical NFC tag that you can purchase and link to your profile. It allows you to share your digital business card with a single tap on any modern smartphone, providing a seamless and impressive networking experience."
    },
    {
        question: "How do I report inappropriate content?",
        answer: "If you encounter content or a user that violates our community guidelines, please visit the 'Report a Violation' page in the support section. Provide as much detail as possible, including links to the content or profile, so our team can investigate."
    }
]

export default function FaqsPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2"><HelpCircle />Frequently Asked Questions</CardTitle>
        <CardDescription>Find quick answers to common questions about BYD.Bio.</CardDescription>
      </CardHeader>
      
       <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {faq.answer}
                </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
