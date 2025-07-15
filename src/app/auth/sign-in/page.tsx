
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
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password cannot be empty."),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loading: authLoading } = useAuth();


  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Sign In Successful",
        description: "Welcome back!",
      });
      router.push('/');
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      
      switch (error.code) {
        case 'auth/invalid-credential':
          description = "Invalid email or password. Please check your credentials and try again.";
          break;
        case 'auth/user-disabled':
          description = "This account has been disabled. Please contact support.";
          break;
        case 'auth/too-many-requests':
          description = "Too many failed login attempts. Please reset your password or try again later.";
          break;
        default:
          description = "An unexpected error occurred. Please try again.";
      }
      
      toast({
        title: "Sign In Failed",
        description: description,
        variant: "destructive",
      });
      // Clear the password field on a failed attempt
      form.setValue('password', '');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Welcome back! Please sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                   <div className="text-right">
                    <Button asChild variant="link" size="sm" className="px-0 h-auto">
                      <Link href="/auth/reset-password">Forgot password?</Link>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
                {isSubmitting || authLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
