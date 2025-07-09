
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      // We intentionally don't handle success here, but in the `finally` block
      // to ensure the same user experience regardless of the outcome.
    } catch (error: any) {
      // Intentionally swallow specific errors like 'auth/user-not-found'
      // to prevent email enumeration. We will only log it for debugging purposes.
      console.error(`Password reset attempt for ${data.email} failed silently:`, error.code);
    } finally {
      // Always show the same confirmation message to the user.
      toast({
        title: "Request Sent",
        description: "If an account exists for this email, you will receive a password reset link shortly.",
      });
      setIsSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {isSubmitted
            ? "Please check your email for the reset link."
            : "Enter your email to receive a password reset link."
          }
        </CardDescription>
      </CardHeader>
      {!isSubmitted && (
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        </CardContent>
      )}
      <CardFooter className="justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/auth/sign-in"><ArrowLeft className="mr-2 h-4 w-4" />Back to Sign In</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
