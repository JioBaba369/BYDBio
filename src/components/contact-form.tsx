
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm, type ContactFormState } from '@/app/actions/contact';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {pending ? 'Sending...' : 'Send Message'}
    </Button>
  );
}

export function ContactForm({ recipientId }: { recipientId: string }) {
  const initialState: ContactFormState = { message: '', errors: {} };
  const [state, dispatch] = useFormState(submitContactForm, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        formRef.current?.reset();
        setIsSubmitted(true);
      } else {
        const errorDescription = state.errors ? Object.values(state.errors).flat().join(' ') : state.message;
        toast({
          title: 'Message Not Sent',
          description: errorDescription,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);
  
  if (isSubmitted) {
      return (
        <Card className="bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl border-primary/10">
          <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[440px]">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold">Message Sent!</h3>
            <p className="text-muted-foreground mt-2">Your message has been delivered. Thank you for reaching out.</p>
            <Separator className="my-6" />
            <p className="text-muted-foreground">Enjoying the platform? Build your own professional hub for free.</p>
             <Button asChild className="mt-4">
                <Link href="/auth/sign-up">
                    Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl border-primary/10">
      <CardHeader>
        <CardTitle>Contact Me</CardTitle>
        <CardDescription>Have a question or want to work together? Send me a message.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={dispatch} className="space-y-4">
          <input type="hidden" name="recipientId" value={recipientId} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required />
              {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input id="email" name="email" type="email" placeholder="jane.doe@example.com" required />
              {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" placeholder="Your message here..." required rows={5}/>
            {state.errors?.message && <p className="text-sm font-medium text-destructive">{state.errors.message[0]}</p>}
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
